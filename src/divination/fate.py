from fastapi import HTTPException
from src.models import DivinationBody
from .base import DivinationFactory

SYS_PROMPT = "你是一个姻缘助手，我给你发两个人的名字，用逗号隔开，"\
    "你来随机说一下，这两个人之间的缘分如何？"\
    " 不需要很真实，只需要娱乐化的说一下即可，"\
    "你可以根据人名先判断一下这个人名的真实性，"\
    "如果输入是一些类似张三李四之类的，就返回不合适，"\
    "或者如果两个人的名字性别，都是同性，也最好返回不合适。"\
    "然后基本主要围绕, 90%的概率 说二人很合适, 然后10%的概率，"\
    "说对方不合适，并列出为啥这样的原因。"


class Fate(DivinationFactory):

    divination_type = "fate"

    def build_prompt(self, divination_body: DivinationBody) -> tuple[str, str]:
        fate = divination_body.fate
        if not fate:
            raise HTTPException(status_code=400, detail="Fate is required")
        if len(fate.name1) > 40 or len(fate.name2) > 40:
            raise HTTPException(status_code=400, detail="Prompt too long")
        prompt = f'{fate.name1}, {fate.name2}'
        return prompt, SYS_PROMPT
