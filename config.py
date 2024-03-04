import logging

from pydantic import BaseSettings, Field

logging.basicConfig(
    format="%(asctime)s: %(levelname)s: %(name)s: %(message)s",
    level=logging.INFO
)
_logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    api_key: str = Field(default="sk-xxx", exclude=True)
    api_base: str = "https://api.openai.com/v1"
    model: str = "gpt-3.5-turbo"
    rate_limit: str = "60/hour"
    user_rate_limit: str = "600/hour"
    github_client_id: str = ""
    github_client_secret: str = Field(default="", exclude=True)
    jwt_secret: str = Field(default="secret", exclude=True)
    ad_client: str = ""
    ad_slot: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
_logger.info(f"settings: {settings.json()}")
