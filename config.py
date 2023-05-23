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
    rate_limit: str = "10/minute"
    log_dir: str = ""
    db_path: str = "divination.db"
    default_limit: int = 1000
    jwt_secret: str = "secret"
    invite_reward: int = 1000

    class Config:
        env_file = ".env"


settings = Settings()
