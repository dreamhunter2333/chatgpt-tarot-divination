from typing import Optional
from pydantic import BaseModel, Field


class SettingsInfo(BaseModel):
    login_type: str
    user_name: str
    rate_limit: str
    user_rate_limit: str
    ad_client: str = ""
    ad_slot: str = ""
    enable_login: bool = False
    enable_rate_limit: bool = False


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


class Fate(BaseModel):
    name1: str
    name2: str


class DivinationBody(BaseModel):
    prompt: str
    prompt_type: str
    birthday: str
    new_name: Optional[NewName] = None
    plum_flower: Optional[PlumFlower] = None
    fate: Optional[Fate] = None


class BirthdayBody(BaseModel):
    birthday: str = Field(example="2000-08-17 00:00:00")


class CommonResponse(BaseModel):
    content: str
    request_id: str
