from fastapi import HTTPException
from src.models import DivinationBody
from .base import DivinationFactory

DREAM_PROMPT = "我请求你担任中国传统的周公解梦师的角色。" \
    "我将会给你我的梦境，请你解释我的梦境，" \
    "并为其提供相应的指导和建议。"


class DreamFactory(DivinationFactory):

    divination_type = "dream"

    def build_prompt(self, divination_body: DivinationBody) -> tuple[str, str]:
        if len(divination_body.prompt) > 40:
            raise HTTPException(status_code=400, detail="Prompt too long")
        prompt = f"我的梦境是: {divination_body.prompt}"
        return prompt, DREAM_PROMPT
