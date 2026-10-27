import json
import math
from typing import Optional
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI

import logging

from fastapi import Depends, HTTPException, Request, status


from src.config import settings
from fastapi import APIRouter

from src.models import DivinationBody, User
from src.user import get_user
from src.limiter import get_real_ipaddr, check_rate_limit
from src.divination import DivinationFactory

# openai sdk refuses an empty key, the tauri sidecar runs without one and relies on x-api-key
client = AsyncOpenAI(api_key=settings.api_key, base_url=settings.api_base) if settings.api_key else None
router = APIRouter()
_logger = logging.getLogger(__name__)
STOP_WORDS = [
    "忽略", "ignore", "指令", "命令", "command", "help", "帮助", "之前",
    "幫助", "現在", "開始", "开始", "start", "restart", "重新开始", "重新開始",
    "遵守", "遵循", "遵从", "遵從"
]


@router.post("/api/divination")
async def divination(
        request: Request,
        divination_body: DivinationBody,
        user: Optional[User] = Depends(get_user)
):

    real_ip = get_real_ipaddr(request)
    # rate limit when not login
    if settings.enable_rate_limit:
        if not user:
            max_reqs, time_window_seconds = settings.rate_limit
            check_rate_limit(f"{settings.project_name}:{real_ip}", time_window_seconds, max_reqs)
        else:
            max_reqs, time_window_seconds = settings.user_rate_limit
            check_rate_limit(
                f"{settings.project_name}:{user.login_type}:{user.user_name}", time_window_seconds, max_reqs
            )

    _logger.info(
        f"Request from {real_ip}, "
        f"user={user.model_dump_json(context=dict(ensure_ascii=False)) if user else None}, "
        f"body={divination_body.model_dump_json(context=dict(ensure_ascii=False))}"
    )
    if any(w in divination_body.prompt.lower() for w in STOP_WORDS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Prompt contains stop words"
        )
    divination_obj = DivinationFactory.get(divination_body.prompt_type)
    if not divination_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No prompt type {divination_body.prompt_type} not supported"
        )
    prompt, system_prompt = divination_obj.build_prompt(divination_body)

    # custom api key, model, base url, api style and temperature support
    custom_base_url = request.headers.get("x-api-url")
    custom_api_key = request.headers.get("x-api-key")
    custom_api_model = request.headers.get("x-api-model")
    api_client = client
    api_model = custom_api_model if custom_api_model else settings.model
    if custom_base_url and custom_api_key:
        api_client = AsyncOpenAI(api_key=custom_api_key, base_url=custom_base_url)
    elif custom_api_key:
        api_client = AsyncOpenAI(api_key=custom_api_key, base_url=settings.api_base)

    if not (settings.api_base or custom_base_url) or not (settings.api_key or custom_api_key):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="请设置 API KEY 和 API BASE URL"
        )

    # custom clients default to the chat api, most third party providers don't support responses
    api_style = request.headers.get("x-api-style") or ("chat" if custom_api_key else settings.api_style)
    if api_style not in ("chat", "responses"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"API style {api_style} not supported"
        )
    api_temperature = settings.api_temperature
    custom_temperature = request.headers.get("x-api-temperature")
    if custom_temperature:
        try:
            api_temperature = float(custom_temperature)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="x-api-temperature must be a number"
            )
    if not math.isfinite(api_temperature) or not 0 <= api_temperature <= 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="x-api-temperature must be between 0 and 2"
        )
    # a custom client controls its own reasoning effort, the server default must not leak into it
    api_reasoning_effort = request.headers.get("x-api-reasoning-effort")
    if not api_reasoning_effort and not custom_api_key:
        api_reasoning_effort = settings.api_reasoning_effort

    try:
        if api_style == "responses":
            # reasoning models reject temperature, so only the reasoning effort is sent
            responses_params = {
                "model": api_model,
                "instructions": system_prompt,
                "input": prompt,
                "max_output_tokens": settings.api_max_output_tokens,
                "stream": True,
            }
            if api_reasoning_effort:
                responses_params["reasoning"] = {"effort": api_reasoning_effort}
            upstream = await api_client.responses.create(**responses_params)
        else:
            upstream = await api_client.chat.completions.create(
                model=api_model,
                max_tokens=settings.api_max_output_tokens,
                temperature=api_temperature,
                top_p=1,
                stream=True,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {"role": "user", "content": prompt}
                ]
            )
    except Exception as e:
        _logger.error(f"OpenAI API error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OpenAI API error: {str(e)}"
        )

    async def text_chunks():
        async for event in upstream:
            if api_style == "responses":
                if event.type == "response.output_text.delta":
                    yield event.delta
                elif event.type == "error":
                    raise RuntimeError(event.message or "upstream error")
                elif event.type in ("response.failed", "response.incomplete"):
                    raise RuntimeError(f"upstream response {event.type.split('.')[-1]}")
                continue
            if event.choices and event.choices[0].delta and event.choices[0].delta.content:
                yield event.choices[0].delta.content
            if event.choices and event.choices[0].finish_reason == "length":
                raise RuntimeError("upstream output truncated")

    async def get_openai_generator():
        try:
            async for chunk in text_chunks():
                yield f"data: {json.dumps(chunk)}\n\n"
        except Exception as e:
            _logger.error(f"Streaming error: {e}")
            yield f"event: FatalError\ndata: {str(e).replace(chr(10), ' ')}\n\n"

    return StreamingResponse(get_openai_generator(), media_type='text/event-stream')
