import time
import logging

from collections import defaultdict
from fastapi import HTTPException, Request

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
    cur_timestamp = int(time.time())
    try:
        # remove expired records
        while request_limit_map[key] and request_limit_map[key][0] < (cur_timestamp - time_window_seconds):
            request_limit_map[key].pop(0)
        # add current timestamp
        request_limit_map[key].append(cur_timestamp)
        req_count = len(request_limit_map[key])
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
