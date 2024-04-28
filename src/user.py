import datetime
import logging
from typing import Optional
import jwt

from fastapi import Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from src.config import settings
from src.models import User
from fastapi import HTTPException

_logger = logging.getLogger(__name__)
security = HTTPBearer()
DEFAULT_TOKEN = ["xxx", "undefined"]


def get_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Optional[User]:
    try:
        jwt_token = credentials.credentials
        if not jwt_token or jwt_token in DEFAULT_TOKEN:
            return
        payload = jwt.decode(
            jwt_token, settings.jwt_secret, algorithms=["HS256"])
        jwt_payload = User.parse_obj(payload)
        if jwt_payload.expire_at < datetime.datetime.now().timestamp():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
        return jwt_payload
    except Exception:
        return
