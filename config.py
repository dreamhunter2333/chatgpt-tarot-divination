import logging

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

    class Config:
        env_file = ".env"


settings = Settings()
