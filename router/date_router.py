import datetime
import logging
import sxtwl

from fastapi import APIRouter

router = APIRouter()
_logger = logging.getLogger(__name__)

Gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
Zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
ShX = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"]
ymc = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"]
rmc = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
       "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
       "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十", "卅一"]
XiZ = ['摩羯', '水瓶', '双鱼', '白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手']
WeekCn = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]


@router.get("/api/date")
async def change_date(date: str, is_lunar: bool = False) -> str:
    if is_lunar:
        # 从农历年月日获取一天的信息
        return ""
    solar_date = datetime.datetime.strptime(
        date, '%Y-%m-%d %H:%M:%S'
    )
    # 从公历年月日获取一天的信息
    lunar_date = sxtwl.fromSolar(
        solar_date.year, solar_date.month, solar_date.day)
    yTG = lunar_date.getYearGZ(True)

    return "{}年 {}{}年 {}{}月{} {}座".format(
        ShX[yTG.dz],
        Gan[yTG.tg],
        Zhi[yTG.dz],
        '闰' if lunar_date.isLunarLeap() else '',
        ymc[lunar_date.getLunarMonth() - 1],
        rmc[lunar_date.getLunarDay() - 1],
        XiZ[lunar_date.getConstellation() - 1]
    )
