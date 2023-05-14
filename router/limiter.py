from fastapi import Request

from slowapi import Limiter


def get_real_ipaddr(request: Request) -> str:
    if "x-real-ip" in request.headers:
        return request.headers["x-real-ip"]
    else:
        if not request.client or not request.client.host:
            return "127.0.0.1"

        return request.client.host


limiter = Limiter(key_func=get_real_ipaddr)
