import logging
from typing import Tuple

from pydantic import Field
from pydantic_settings import BaseSettings

_logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    api_key: str = Field(default="sk-xxx", exclude=True)
    api_base: str = "https://api.openai.com/v1"
    model: str = "gpt-3.5-turbo"
    enable_rate_limit: bool = True
    # rate limit xxx request per xx seconds
    rate_limit: Tuple[int, int] = (60, 60 * 60)
    user_rate_limit: Tuple[int, int] = (600, 60 * 60)
    github_client_id: str = ""
    github_client_secret: str = Field(default="", exclude=True)
    jwt_secret: str = Field(default="secret", exclude=True)
    ad_client: str = ""
    ad_slot: str = ""

    def get_human_rate_limit(self) -> str:
        max_reqs, time_window_seconds = self.rate_limit
        # convert to human readable format
        return f"{max_reqs}req/{time_window_seconds}seconds"

    def get_human_user_rate_limit(self) -> str:
        max_reqs, time_window_seconds = self.user_rate_limit
        # convert to human readable format
        return f"{max_reqs}req/{time_window_seconds}seconds"

    class Config:
        env_file = ".env"


settings = Settings()
