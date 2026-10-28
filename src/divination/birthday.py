from lunar_python import Solar

from src.models import DivinationBody
from .base import DivinationFactory, parse_birthday

BIRTHDAY_PROMPT = (
    "我请求你担任中国传统的生辰八字命理师的角色。"
    "我会给你我排好的八字命盘（生辰八字），"
    "请你基于命盘分析五行属性、吉凶祸福、财运、婚姻、健康、事业等方面的情况，"
    "并为我提供相应的指导和建议。"
    "请直接使用给定的命盘进行解读，不要重新推算命盘。"
)


class BirthdayFactory(DivinationFactory):

    divination_type = "birthday"

    def build_prompt(self, divination_body: DivinationBody) -> tuple[str, str]:
        return self.internal_build_prompt(divination_body.birthday)

    def internal_build_prompt(self, birthday: str) -> tuple[str, str]:
        birthday = parse_birthday(birthday)
        eight_char = Solar.fromYmdHms(
            birthday.year, birthday.month, birthday.day,
            birthday.hour, birthday.minute, birthday.second
        ).getLunar().getEightChar()
        prompt = (
            f"我的公历生日是{birthday.year}年{birthday.month}月{birthday.day}日"
            f"{birthday.hour}时{birthday.minute}分{birthday.second}秒，"
            f"已经排好的八字命盘（四柱）是："
            f"年柱{eight_char.getYear()}、月柱{eight_char.getMonth()}、"
            f"日柱{eight_char.getDay()}、时柱{eight_char.getTime()}。"
            f"请基于这个命盘解读，不要重新推算。"
        )
        return prompt, BIRTHDAY_PROMPT