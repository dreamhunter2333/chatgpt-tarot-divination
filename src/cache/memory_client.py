import time
import logging
import cachetools

from collections import defaultdict

from fastapi import HTTPException

from typing import Optional

from .base import CacheClientBase


_logger = logging.getLogger(__name__)


def ttu_func(_key, value, now):
    _, expire_seconds = value
    return now + expire_seconds


class MemoryCacheClient(CacheClientBase):

    _type = "memory"
    token_cache = cachetools.TLRUCache(
        maxsize=float("inf"),
        ttu=ttu_func,
        timer=time.time
    )
    request_limit_map = defaultdict(list)

    @classmethod
    def store_token(cls, key: str, token: str, expire_seconds: int) -> None:
        try:
            cls.token_cache[key] = (token, expire_seconds)
            return
        except Exception as e:
            _logger.error(f"Store token failed: {e}")
        raise HTTPException(
            status_code=400, detail="Store token failed"
        )

    @classmethod
    def get_token(cls, key: str) -> Optional[str]:
        try:
            if key in cls.token_cache:
                token, expire_seconds = cls.token_cache[key]
                return token
        except Exception as e:
            _logger.error(f"Get token failed: {e}")
            return None

    @classmethod
    def check_rate_limit(cls, key: str, time_window_seconds: int, max_requests: int) -> None:
        cur_timestamp = int(time.time())
        try:
            # remove expired records
            while cls.request_limit_map[key] and cls.request_limit_map[key][0] < (cur_timestamp - time_window_seconds):
                cls.request_limit_map[key].pop(0)
            # add current timestamp
            cls.request_limit_map[key].append(cur_timestamp)
            req_count = len(cls.request_limit_map[key])
            if req_count >= max_requests:
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
