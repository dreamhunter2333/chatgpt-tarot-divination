from typing import Optional
import jwt
import datetime
import logging

from fastapi import APIRouter, Depends, HTTPException, status
import requests

from config import settings
from models import OauthBody, SettingsInfo, User
from router.user import get_user

router = APIRouter()
_logger = logging.getLogger(__name__)

GITHUB_URL = "https://github.com/login/oauth/authorize?" \
    f"client_id={settings.github_client_id}" \
    "&scope=user"
GITHUB_TOEKN_URL = "https://github.com/login/oauth/access_token" \
    f"?client_id={settings.github_client_id}" \
    f"&client_secret={settings.github_client_secret}"
GITHUB_USER_URL = "https://api.github.com/user"


@router.get("/api/v1/settings", tags=["User"])
def info(user: Optional[User] = Depends(get_user)):
    return SettingsInfo(
        login_type=user.login_type if user else "",
        user_name=user.user_name if user else "",
        ad_client=settings.ad_client,
        ad_slot=settings.ad_slot,
        rate_limit=settings.rate_limit,
        user_rate_limit=settings.user_rate_limit
    )


@router.get("/api/v1/login", tags=["User"])
def login(login_type: str, redirect_url: str):
    if login_type == "github":
        return f"{GITHUB_URL}&redirect_uri={redirect_url}"
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        content="Login type not supported"
    )


@router.post("/api/v1/oauth", tags=["User"])
def oauth(oauth_body: OauthBody):
    if oauth_body.login_type == "github" and oauth_body.code:
        access_token = requests.post(
            f"{GITHUB_TOEKN_URL}&code={oauth_body.code}",
            headers={"Accept": "application/json"}
        ).json()['access_token']
        res = requests.get(
            GITHUB_USER_URL,
            headers={
                "Authorization": f"token {access_token}",
                "Accept": "application/json"
            }
        ).json()
        user_name = res['login']
        return jwt.encode(
            User(
                login_type=oauth_body.login_type,
                user_name=user_name,
                expire_at=(
                    datetime.datetime.now() +
                    datetime.timedelta(days=30)
                ).timestamp(),
            ).dict(),
            settings.jwt_secret, algorithm="HS256"
        )
    raise HTTPException(status_code=400, detail="Login type not supported")
