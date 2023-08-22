import json
from typing import Optional
import openai
import logging

from datetime import datetime
from fastapi import Depends, HTTPException, Request, status


from config import settings
from fastapi import APIRouter

from models import DivinationBody, User
from router.user import get_user
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


@limiter.limit(settings.rate_limit)
def limit_when_not_login(request: Request):
    """
    Limit when not login
    """


def limit_when_login(request: Request, user: User):
    """
    Limit when login
    """
    @limiter.limit(settings.user_rate_limit, key_func=lambda: (user.user_name, user.login_type))
    def limit(request: Request):
        """
        Limit when login
        """
    limit(request)


@router.post("/api/divination")
async def divination(
        request: Request,
        divination_body: DivinationBody,
        user: Optional[User] = Depends(get_user)
):

    # rate limit when not login
    if not user:
        limit_when_not_login(request)
    else:
        limit_when_login(request, user)

    _logger.info(
        f"Request from {get_real_ipaddr(request)}, user={user.json(ensure_ascii=False) if user else None} body={divination_body.json(ensure_ascii=False)}"
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
            {
                "role": "system",
                "content": system_prompt
            },
            {"role": "user", "content": prompt}
        ]
    )
    res = response['choices'][0]['message']['content']
    latency = datetime.now() - start_time
    file_logger.info(
        f"Request from {get_real_ipaddr(request)}, "
        f"user={user.json(ensure_ascii=False) if user else None}, "
        f"latency_seconds={latency.total_seconds()}, "
        f"body={divination_body.json(ensure_ascii=False)}, "
        f"res={json.dumps(res, ensure_ascii=False)}"
    )
    return res
