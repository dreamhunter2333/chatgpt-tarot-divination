import logging
import os
from typing import List, Tuple

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_logger = logging.getLogger(__name__)


class Settings(BaseSettings):

    model_config = SettingsConfigDict(env_file=".env")

    # project settings
    project_name: str = "ai-divination"

    # OpenAI API settings
    api_key: str = Field(default="", exclude=True)
    api_base: str = "https://api.openai.com/v1"
    model: str = "gpt-3.5-turbo"
    # upstream api style: chat | responses
    api_style: str = "chat"
    # temperature used by the chat api, ignored by the responses api
    api_temperature: float = 0.9
    # reasoning effort for responses api, empty means provider default
    api_reasoning_effort: str = ""
    # output token budget for responses api, reasoning tokens are billed against it too
    api_max_output_tokens: int = 4000

    # github oauth login settings
    github_client_id: str = ""
    github_client_secret: str = Field(default="", exclude=True)
    # empty disables login, tokens signed with a guessable default would bypass the rate limit
    jwt_secret: str = Field(default="", exclude=True)

    # google ads settings
    ad_client: str = ""
    ad_slot: str = ""

    # openai settings defaults
    default_api_base: str = "https://api.openai.com/v1"
    default_model: str = "gpt-3.5-turbo"
    purchase_url: str = ""

    # cache settings
    cache_client_type: str = "memory"
    redis_url: str = Field(default="", exclude=True, alias="KV_URL")
    upstash_api_url: str = Field(default="", alias="KV_REST_API_URL")
    upstash_api_token: str = Field(default="", exclude=True, alias="KV_REST_API_TOKEN")

    # only trust x-real-ip when a proxy overwrites it, vercel always does
    trust_proxy_headers: bool = bool(os.getenv("VERCEL"))
    # allow x-api-url to point at loopback / private networks, e.g. a local llm
    allow_private_api_url: bool = False
    cors_origins: List[str] = ["*"]

    # rate limit settings
    enable_rate_limit: bool = True
    # rate limit xxx request per xx seconds
    rate_limit: Tuple[int, int] = (60, 60 * 60)
    user_rate_limit: Tuple[int, int] = (600, 60 * 60)

    def get_human_rate_limit(self) -> str:
        max_reqs, time_window_seconds = self.rate_limit
        # convert to human readable format
        return f"{max_reqs}req/{time_window_seconds}seconds"

    def get_human_user_rate_limit(self) -> str:
        max_reqs, time_window_seconds = self.user_rate_limit
        # convert to human readable format
        return f"{max_reqs}req/{time_window_seconds}seconds"


settings = Settings()
