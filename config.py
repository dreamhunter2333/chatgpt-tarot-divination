from pydantic import BaseSettings


TAROT_PROMPT = "我请求你担任塔罗占卜师的角色。 " \
    "您将接受我的问题并使用虚拟塔罗牌进行塔罗牌阅读。 " \
    "不要忘记洗牌并介绍您在本套牌中使用的套牌。 " \
    "请帮我抽3张随机卡。 " \
    "拿到卡片后，请您仔细说明它们的意义，" \
    "解释哪张卡片属于未来或现在或过去，结合我的问题来解释它们，" \
    "并给我有用的建议或我现在应该做的事情."

BIRTHDAY_PROMPT = "我请求你担任中国传统的生辰八字算命的角色。" \
    "我将会给你我的生日，请你根据我的生日推算命盘，" \
    "分析五行属性、吉凶祸福、财运、婚姻、健康、事业等方面的情况，" \
    "并为其提供相应的指导和建议。"


NAME_PROMPT = "我请求你担任中国传统的姓名五格算命师的角色。" \
    "我将会给你我的名字，请你根据我的名字推算，" \
    "分析姓氏格、名字格、和自己格。" \
    "并为其提供相应的指导和建议。"

DREAM_PROMPT = "我请求你担任中国传统的周公解梦师的角色。" \
    "我将会给你我的梦境，请你解释我的梦境，" \
    "并为其提供相应的指导和建议。"

NEW_NAME_PROMPT = (
    "我请求你担任起名师的角色，"
    "我将会给你我的姓氏、生日、性别等，"
    "请返回你认为最适合我的名字，"
    "请注意姓氏在前，名字在后。"
)


PROMPT_MAP = {
    "tarot": TAROT_PROMPT,
    "birthday": BIRTHDAY_PROMPT,
    "name": NAME_PROMPT,
    "dream": DREAM_PROMPT,
    "new_name": NEW_NAME_PROMPT,
}


class Settings(BaseSettings):
    api_key: str = "sk-xxx"
    api_base: str = "https://api.openai.com/v1"
    model: str = "gpt-3.5-turbo"
    rate_limit: str = "10/minute"

    class Config:
        env_file = ".env"


settings = Settings()
