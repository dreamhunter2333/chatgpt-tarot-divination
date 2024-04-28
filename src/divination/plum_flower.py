from fastapi import HTTPException
from src.models import DivinationBody
from .base import DivinationFactory

SYS_PROMPT = "我请求你担任中国传统的梅花易数占卜师的角色。" \
    "我会随意说出两个数，第一个数取为上卦，第二个数取为下卦。" \
    "请你直接以数起卦, 并向我解释结果"


class PlumFlowerFactory(DivinationFactory):

    divination_type = "plum_flower"

    def build_prompt(self, divination_body: DivinationBody) -> tuple[str, str]:
        if not divination_body.plum_flower:
            raise HTTPException(status_code=400, detail="No plum_flower")
        prompt = f"我选择的数字是: {divination_body.plum_flower.num1} 和 {divination_body.plum_flower.num2}"
        return prompt, SYS_PROMPT
