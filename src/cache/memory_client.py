import time
import logging
import cachetools



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
    # Fix memory leak: use TTLCache instead of defaultdict
    # TTL should be at least longer than the longest rate limit window (1 hour)
    request_limit_map = cachetools.TTLCache(
        maxsize=10000,
        ttl=3600 + 60,
        timer=time.time
    )

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
            # get existing history or create new list
            if key not in cls.request_limit_map:
                cls.request_limit_map[key] = []
            
            history = cls.request_limit_map[key]
            
            # remove expired records
            while history and history[0] < (cur_timestamp - time_window_seconds):
                history.pop(0)
            
            # add current timestamp
            history.append(cur_timestamp)
             # update cache to refresh TTL
            cls.request_limit_map[key] = history
            
            req_count = len(history)
            if req_count > max_requests:
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
