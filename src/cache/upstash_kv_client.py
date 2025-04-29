import logging

import time
from typing import Optional

from fastapi import HTTPException
import requests

from src.config import settings

from .base import CacheClientBase


_logger = logging.getLogger(__name__)


class UpstashCacheClient(CacheClientBase):

    _type = "upstash"

    @classmethod
    def store_token(cls, key: str, token: str, expire_seconds: int) -> None:
        try:
            res = requests.post(
                f"{settings.upstash_api_url}",
                data=f'["SET", "{key}", "{token}", "EX", "{expire_seconds}"]',
                headers={
                    "Authorization": f"Bearer {settings.upstash_api_token}",
                    "Content-Type": "application/json",
                }
            ).json()
            if res.get("result") == "OK":
                return
        except Exception as e:
            _logger.error(f"Store token failed: {e}")
        raise HTTPException(
            status_code=400, detail="Store token failed"
        )

    @classmethod
    def get_token(cls, key: str) -> Optional[str]:
        try:
            res = requests.post(
                f"{settings.upstash_api_url}",
                data=f'["GET", "{key}"]',
                headers={
                    "Authorization": f"Bearer {settings.upstash_api_token}",
                    "Content-Type": "application/json",
                }
            )
            if res.status_code != 200:
                _logger.error(f"Get token failed: {res.status_code} {res.text}")
                return None
            return res.json().get("result")
        except Exception as e:
            _logger.error(f"Get token failed: {e}")
        return None

    @classmethod
    def check_rate_limit(cls, key: str, time_window_seconds: int, max_requests: int) -> None:
        # user zest to check rate limit
        cur_timestamp = int(time.time())
        try:
            res = requests.post(
                f"{settings.upstash_api_url}/multi-exec",
                data="["
                f'["ZREMRANGEBYSCORE", "{key}", "-inf", {cur_timestamp - time_window_seconds}],'
                f'["ZADD", "{key}", {cur_timestamp}, {cur_timestamp}],'
                f'["EXPIRE", "{key}", {time_window_seconds}],'
                f'["ZCARD", "{key}"]'
                "]",
                headers={
                    "Authorization": f"Bearer {settings.upstash_api_token}",
                    "Content-Type": "application/json",
                }
            ).json()
            if not all(["result" in r for r in res]) or len(res) != 4:
                raise HTTPException(
                    status_code=400, detail="Can't get rate limit result"
                )
            _, _, _, req_count = res
            if req_count.get("result", 0) >= max_requests:
                raise HTTPException(
                    status_code=429, detail="Rate limit exceeded"
                )
            return
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            _logger.error(f"Rate limit failed: {e}")
        raise HTTPException(
            status_code=400, detail="Rate limit failed"
        )
