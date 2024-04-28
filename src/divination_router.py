import json
import uuid
import openai
from openai import OpenAI

import logging

from datetime import datetime
from fastapi import Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from src.config import settings
from fastapi import APIRouter

from src.models import BirthdayBody, CommonResponse
from src.limiter import get_real_ipaddr
from .divination.birthday import BirthdayFactory

client = OpenAI(api_key="", base_url=settings.api_base)
router = APIRouter()
security = HTTPBearer()
_logger = logging.getLogger(__name__)


def get_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    return credentials.credentials


@router.post("/api/streaming_divination/birthday", tags=["divination"])
async def birthday_divination_streaming(
        request: Request,
        birthday_body: BirthdayBody,
        token: str = Depends(get_token)
) -> StreamingResponse:
    _logger.info(
        f"Request from {get_real_ipaddr(request)}, birthday_body={birthday_body}"
    )
    prompt, system_prompt = BirthdayFactory().internal_build_prompt(
        birthday_body.birthday
    )
    return common_openai_streaming_call(token, prompt, system_prompt)


@router.post("/api/divination/birthday", tags=["divination"])
async def birthday_divination(
        request: Request,
        birthday_body: BirthdayBody,
        token: str = Depends(get_token)
) -> CommonResponse:
    _logger.info(
        f"Request from {get_real_ipaddr(request)}, birthday_body={birthday_body}"
    )
    prompt, system_prompt = BirthdayFactory().internal_build_prompt(
        birthday_body.birthday
    )
    return common_openai_call(request, token, prompt, system_prompt)


def common_openai_streaming_call(
        token: str,
        prompt: str,
        system_prompt: str
) -> StreamingResponse:
    def get_openai_generator():
        try:
            openai_stream = client.chat.completions.create(
                api_key=token,
                model=settings.model,
                max_tokens=1000,
                temperature=0.9,
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
        except openai.OpenAIError as e:
            raise HTTPException(
                status_code=500,
                detail=f"OpenAI error: {e}"
            )
        for event in openai_stream:
            if "content" in event.choices[0].delta:
                current_response = event.choices[0].delta.content
                yield current_response

    return StreamingResponse(get_openai_generator(), media_type='text/event-stream')


def common_openai_call(
        request: Request,
        token: str,
        prompt: str,
        system_prompt: str
) -> CommonResponse:
    start_time = datetime.now()
    request_id = uuid.uuid4()

    try:
        response = client.chat.completions.create(
            api_key=token,
            model=settings.model,
            max_tokens=1000,
            temperature=0.9,
            top_p=1,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {"role": "user", "content": prompt}
            ]
        )
    except openai.OpenAIError as e:
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI error: {e}"
        )

    res = response.choices[0].message.content
    latency = datetime.now() - start_time
    _logger.info(
        f"Request {request_id}:"
        f"Request from {get_real_ipaddr(request)}, "
        f"latency_seconds={latency.total_seconds()}, "
        f"prompt={prompt},"
        f"res={json.dumps(res, ensure_ascii=False)}"
    )
    return CommonResponse(
        content=res,
        request_id=request_id.hex
    )
