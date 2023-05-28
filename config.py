import logging
from typing import Optional

from pydantic import BaseSettings

logging.basicConfig(
    format="%(asctime)s: %(levelname)s: %(name)s: %(message)s",
    level=logging.INFO
)


class Settings(BaseSettings):
    api_key: str = "sk-xxx"
    api_base: str = "https://api.openai.com/v1"
    model: str = "gpt-3.5-turbo"
    rate_limit: str = "60/hour"
    user_rate_limit: str = "600/hour"
    log_dir: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""
    jwt_secret: str = "secret"
    ad_client: str = ""
    ad_slot: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
