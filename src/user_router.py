import jwt
import httpx
import datetime
import logging

from typing import Optional
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, status

from src.config import settings
from src.models import OauthBody, SettingsInfo, User
from src.user import get_user

router = APIRouter()
_logger = logging.getLogger(__name__)

GITHUB_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"


@router.get("/api/v1/settings", tags=["User"])
async def info(user: Optional[User] = Depends(get_user)):
    return SettingsInfo(
        login_type=user.login_type if user else "",
        user_name=user.user_name if user else "",
        ad_client=settings.ad_client,
        ad_slot=settings.ad_slot,
        rate_limit=settings.get_human_rate_limit(),
        user_rate_limit=settings.get_human_user_rate_limit(),
        enable_login=bool(settings.github_client_id),
        enable_rate_limit=settings.enable_rate_limit,
        default_api_base=settings.default_api_base,
        default_model=settings.default_model,
        purchase_url=settings.purchase_url
    )


@router.get("/api/v1/login", tags=["User"])
async def login(login_type: str, redirect_url: str, state: str = ""):
    if login_type == "github":
        return f"{GITHUB_URL}?" + urlencode({
            "client_id": settings.github_client_id,
            "scope": "user:email",
            "redirect_uri": redirect_url,
            "state": state,
        })
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Login type not supported"
    )


@router.post("/api/v1/oauth", tags=["User"])
async def oauth(oauth_body: OauthBody):
    if oauth_body.login_type == "github" and oauth_body.code:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                GITHUB_TOKEN_URL,
                params={
                    "client_id": settings.github_client_id,
                    "client_secret": settings.github_client_secret,
                    "code": oauth_body.code,
                },
                headers={"Accept": "application/json"}
            )
            access_token = resp.json().get("access_token")
            if not access_token:
                raise HTTPException(status_code=400, detail="GitHub OAuth failed")

            res = await client.get(
                GITHUB_USER_URL,
                headers={
                    "Authorization": f"token {access_token}",
                    "Accept": "application/json"
                }
            )
            user_data = res.json()

        user_name = user_data['login']
        return jwt.encode(
            User(
                login_type=oauth_body.login_type,
                user_name=user_name,
                expire_at=(
                    datetime.datetime.now() +
                    datetime.timedelta(days=30)
                ).timestamp(),
            ).model_dump(),
            settings.jwt_secret, algorithm="HS256"
        )
    raise HTTPException(status_code=400, detail="Login type not supported")
