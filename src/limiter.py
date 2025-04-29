import logging

from collections import defaultdict
from fastapi import Request

from .cache import CacheClientFactory

_logger = logging.getLogger(__name__)
request_limit_map = defaultdict(list)


def get_real_ipaddr(request: Request) -> str:
    if "x-real-ip" in request.headers:
        return request.headers["x-real-ip"]
    else:
        if not request.client or not request.client.host:
            return "127.0.0.1"

        return request.client.host


def check_rate_limit(key: str, time_window_seconds: int, max_requests: int) -> None:
    cache_client = CacheClientFactory.get_client()
    cache_client.check_rate_limit(key, time_window_seconds, max_requests)
