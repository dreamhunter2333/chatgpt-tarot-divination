from fastapi import HTTPException
from src.models import DivinationBody
from .base import DivinationFactory

TAROT_PROMPT = "我请求你担任塔罗占卜师的角色。 " \
    "您将接受我的问题并使用虚拟塔罗牌进行塔罗牌阅读。 " \
    "不要忘记洗牌并介绍您在本套牌中使用的套牌。 " \
    "请帮我抽3张随机卡。 " \
    "拿到卡片后，请您仔细说明它们的意义，" \
    "解释哪张卡片属于未来或现在或过去，结合我的问题来解释它们，" \
    "并给我有用的建议或我现在应该做的事情."


class TarotFactory(DivinationFactory):

    divination_type = "tarot"

    def build_prompt(self, divination_body: DivinationBody) -> tuple[str, str]:
        if len(divination_body.prompt) > 40:
            raise HTTPException(status_code=400, detail="Prompt too long")
        return divination_body.prompt, TAROT_PROMPT
