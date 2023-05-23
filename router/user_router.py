import datetime
from typing import Optional
import jwt
import logging
import bcrypt

from fastapi import APIRouter, Form, status
from fastapi.responses import JSONResponse

from models.db_models import User, DBSession

from config import settings
from models import JwtPayload

router = APIRouter()
_logger = logging.getLogger(__name__)


@router.post("/api/register", tags=["User"])
def register(name: str = Form(), password: str = Form(), invite_user_name: Optional[str] = None):
    with DBSession() as session:
        user = session.query(User).filter(
            User.name == name
        ).one_or_none()
        if user:
            _logger.info(f"User already exists: {name}")
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=f"User already exists: {name}")
        if invite_user_name:
            invite_user = session.query(User).filter(
                User.name == invite_user_name
            ).one_or_none()
            if not invite_user:
                _logger.info(f"invite_user do not exists: {invite_user_name}")
                return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=f"invite_user do not exists: {invite_user_name}")
            invite_user.limit += settings.invite_reward
        session.add(User(
            name=name,
            password=bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()),
            limit=settings.default_limit,
        ))
        session.commit()
        _logger.info(f"User register: {name}")
        return JSONResponse(status_code=status.HTTP_201_CREATED, content="User created")


@router.post("/api/login", tags=["User"])
def login(name: str = Form(), password: str = Form()):
    with DBSession() as session:
        user = session.query(User).filter(
            User.name == name
        ).one_or_none()
        if not user:
            _logger.info(f"User not found when login: {name}")
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content="User not found")
        if not bcrypt.checkpw(password.encode('utf-8'), user.password):
            _logger.info(f"Wrong password when login: {name}")
            return JSONResponse(status_code=status.HTTP_403_FORBIDDEN, content="Wrong password")
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=jwt.encode(
                JwtPayload(
                    user_name=user.name,
                    expire_at=(datetime.datetime.now() +
                               datetime.timedelta(days=30)).timestamp(),
                ).dict(),
                settings.jwt_secret, algorithm="HS256"
            )
        )
