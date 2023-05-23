import datetime
import logging
import jwt

from fastapi import Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config import settings
from models import JwtPayload
from fastapi import HTTPException

_logger = logging.getLogger(__name__)
security = HTTPBearer()
DEFAULT_TOKEN = "xxx"


def get_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    try:
        jwt_token = credentials.credentials
        if jwt_token == DEFAULT_TOKEN:
            return ""
        payload = jwt.decode(
            jwt_token, settings.jwt_secret, algorithms=["HS256"])
        jwt_payload = JwtPayload.parse_obj(payload)
        if jwt_payload.expire_at < datetime.datetime.now().timestamp():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
        return jwt_payload.user_name
    except Exception as e:
        _logger.exception(e)
        return ""
