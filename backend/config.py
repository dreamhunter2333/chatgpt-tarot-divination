from pydantic import BaseSettings


PROMPT = "我请求你担任塔罗占卜师的角色。 " \
    "您将接受我的问题并使用虚拟塔罗牌进行塔罗牌阅读。 " \
    "不要忘记洗牌并介绍您在本套牌中使用的套牌。 " \
    "请帮我抽3张随机卡。 " \
    "拿到卡片后，请您仔细说明它们的意义，" \
    "解释哪张卡片属于未来或现在或过去，结合我的问题来解释它们，" \
    "并给我有用的建议或我现在应该做的事情." \
    "我的问题是我的财务状况如何？"


class Settings(BaseSettings):
    api_key: str = "sk-xxx"
    api_base: str = "https://api.openai.com/v1"
    model: str = "gpt-3.5-turbo"
    rate_limit: str = "10/minute"

    class Config:
        env_file = ".env"


settings = Settings()
