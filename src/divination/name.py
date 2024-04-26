from fastapi import HTTPException
from src.models import DivinationBody
from .base import DivinationFactory

NAME_PROMPT = "我请求你担任中国传统的姓名五格算命师的角色。" \
    "我将会给你我的名字，请你根据我的名字推算，" \
    "分析姓氏格、名字格、和自己格。" \
    "并为其提供相应的指导和建议。"


class NameFactory(DivinationFactory):

    divination_type = "name"

    def build_prompt(self, divination_body: DivinationBody) -> tuple[str, str]:
        if len(divination_body.prompt) > 10 or len(divination_body.prompt) < 1:
            raise HTTPException(status_code=400, detail="姓名长度错误")
        prompt = f"我的名字是{divination_body.prompt}"
        return prompt, NAME_PROMPT
