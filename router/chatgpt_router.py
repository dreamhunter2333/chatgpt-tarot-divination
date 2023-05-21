import json
import openai
import logging

from datetime import datetime
from fastapi import HTTPException, Request


from config import settings
from fastapi import APIRouter

from models import DivinationBody
from .limiter import get_real_ipaddr, limiter
from .divination import DivinationFactory
from .file_logger import file_logger

openai.api_key = settings.api_key
openai.api_base = settings.api_base
router = APIRouter()
_logger = logging.getLogger(__name__)
STOP_WORDS = [
    "忽略", "ignore", "指令", "命令", "command", "help", "帮助", "之前",
    "幫助", "現在", "開始", "开始", "start", "restart", "重新开始", "重新開始",
    "遵守", "遵循", "遵从", "遵從"
]
_logger.info(
    f"Loaded divination types: {list(DivinationFactory.divination_map.keys())}"
)


@router.post("/api/divination")
@limiter.limit(settings.rate_limit)
async def chatgpt(request: Request, divination_body: DivinationBody):
    _logger.info(
        f"Request from {get_real_ipaddr(request)}, body={divination_body.json(ensure_ascii=False)}"
    )
    if any(w in divination_body.prompt.lower() for w in STOP_WORDS):
        raise HTTPException(
            status_code=403,
            detail="Prompt contains stop words"
        )
    divination_obj = DivinationFactory.get(divination_body.prompt_type)
    if not divination_obj:
        raise HTTPException(
            status_code=400,
            detail=f"No prompt type {divination_body.prompt_type} not supported"
        )
    prompt, system_prompt = divination_obj.build_prompt(divination_body)

    start_time = datetime.now()

    response = openai.ChatCompletion.create(
        model=settings.model,
        max_tokens=1000,
        temperature=0.9,
        top_p=1,
        messages=[
            {"role": "user", "content": prompt},
            {
                "role": "system",
                "content": system_prompt
            },
        ]
    )
    res = response['choices'][0]['message']['content']
    latency = datetime.now() - start_time
    file_logger.info(
        f"Request from {get_real_ipaddr(request)}, "
        f"latency_seconds={latency.total_seconds()}, "
        f"body={divination_body.json(ensure_ascii=False)}, "
        f"res={json.dumps(res, ensure_ascii=False)}"
    )
    return res
