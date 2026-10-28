import logging

from fastapi import Request
from starlette.concurrency import run_in_threadpool

from .cache import CacheClientFactory

_logger = logging.getLogger(__name__)


def get_real_ipaddr(request: Request) -> str:
    if "x-real-ip" in request.headers:
        return request.headers["x-real-ip"]
    if not request.client or not request.client.host:
        return "127.0.0.1"
    return request.client.host


async def check_rate_limit(key: str, time_window_seconds: int, max_requests: int) -> None:
    cache_client = CacheClientFactory.get_client()
    # cache clients do blocking io, keep them off the event loop
    await run_in_threadpool(cache_client.check_rate_limit, key, time_window_seconds, max_requests)
