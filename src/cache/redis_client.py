import time
from fastapi import HTTPException
import redis
import logging

from typing import Optional

from src.config import settings

from .base import CacheClientBase


_logger = logging.getLogger(__name__)


class RedisCacheClient(CacheClientBase):

    _type = "redis"
    redis_client = None

    @classmethod
    def init_redis(cls):
        if cls.redis_client is None:
            cls.redis_client = redis.Redis.from_url(settings.redis_url, decode_responses=True)

    @classmethod
    def store_token(cls, key: str, token: str, expire_seconds: int) -> None:
        try:
            cls.init_redis()
            cls.redis_client.set(key, token, ex=expire_seconds)
            return
        except Exception as e:
            _logger.error(f"Store token failed: {e}")
        raise HTTPException(
            status_code=400, detail="Store token failed"
        )

    @classmethod
    def get_token(cls, key: str) -> Optional[str]:
        try:
            cls.init_redis()
            return cls.redis_client.get(key)
        except Exception as e:
            _logger.error(f"Get token failed: {e}")
            return None

    @classmethod
    def check_rate_limit(cls, key: str, time_window_seconds: int, max_requests: int) -> None:
        # user zest to check rate limit
        cur_timestamp = int(time.time())
        try:
            cls.init_redis()
            cls.redis_client.zremrangebyscore(key, "-inf", cur_timestamp - time_window_seconds)
            cls.redis_client.zadd(key, {cur_timestamp: cur_timestamp})
            cls.redis_client.expire(key, time_window_seconds)
            req_count = cls.redis_client.zcard(key)
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
