from typing import Optional
from pydantic import BaseModel


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
