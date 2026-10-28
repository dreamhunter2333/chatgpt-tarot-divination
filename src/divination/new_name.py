from fastapi import HTTPException
from lunar_python import Solar

from src.models import DivinationBody
from .base import DivinationFactory, parse_birthday

NEW_NAME_PROMPT = (
    "我请求你担任起名师的角色，"
    "我将会给你我的姓氏、性别和已经排好的八字命盘，"
    "请结合我的五行喜忌返回你认为最适合我的名字，"
    "请注意姓氏在前，名字在后。"
    "请直接使用给定的命盘，不要重新推算。"
)


class NewNameFactory(DivinationFactory):

    divination_type = "new_name"

    def build_prompt(self, divination_body: DivinationBody) -> tuple[str, str]:
        if (not divination_body.new_name or not all([
            divination_body.new_name.surname,
            divination_body.new_name.birthday,
            divination_body.new_name.sex,
        ]) or len(divination_body.new_name.new_name_prompt) > 20):
            raise HTTPException(status_code=400, detail="起名参数错误")

        birthday = parse_birthday(divination_body.new_name.birthday)
        eight_char = Solar.fromYmdHms(
            birthday.year, birthday.month, birthday.day,
            birthday.hour, birthday.minute, birthday.second
        ).getLunar().getEightChar()
        prompt = (
            f"姓氏是{divination_body.new_name.surname},"
            f"性别是{divination_body.new_name.sex},"
            f"生日是{birthday.year}年{birthday.month}月{birthday.day}日"
            f"{birthday.hour}时{birthday.minute}分{birthday.second}秒，"
            f"已经排好的八字命盘（四柱）是："
            f"年柱{eight_char.getYear()}、月柱{eight_char.getMonth()}、"
            f"日柱{eight_char.getDay()}、时柱{eight_char.getTime()}。"
        )
        if divination_body.new_name.new_name_prompt:
            prompt += f",我的要求是: {divination_body.new_name.new_name_prompt}"
        return prompt, NEW_NAME_PROMPT