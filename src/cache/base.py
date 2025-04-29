from typing import Optional


class MetaCacheClient(type):

    cilent_map = {}

    def __init__(cls, name, bases, attrs):
        super().__init__(name, bases, attrs)
        if hasattr(cls, '_type'):
            MetaCacheClient.cilent_map[cls._type] = cls


class CacheClientBase(metaclass=MetaCacheClient):

    @classmethod
    def store_token(cls, key: str, token: str, expire_seconds: int) -> None:
        return

    @classmethod
    def get_token(cls, key: str) -> Optional[str]:
        return None

    @classmethod
    def check_rate_limit(cls, key: str, time_window_seconds: int, max_requests: int) -> None:
        return
