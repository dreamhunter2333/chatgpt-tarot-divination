from typing import Optional
from pydantic import BaseModel


class SettingsInfo(BaseModel):
    login_type: str
    user_name: str
    rate_limit: str
    user_rate_limit: str
    ad_client: str = ""
    ad_slot: str = ""


class OauthBody(BaseModel):
    login_type: str
    code: Optional[str]


class User(BaseModel):
    login_type: str
    user_name: str
    expire_at: float


class NewName(BaseModel):
    surname: str
    sex: str
    birthday: str
    new_name_prompt: str


class PlumFlower(BaseModel):
    num1: int
    num2: int


class DivinationBody(BaseModel):
    prompt: str
    prompt_type: str
    birthday: str
    new_name: Optional[NewName] = None
    plum_flower: Optional[PlumFlower] = None
