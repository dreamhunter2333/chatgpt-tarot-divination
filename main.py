import datetime
import openai
import logging
import uvicorn
import sxtwl

from pydantic import BaseModel

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from config import PROMPT_MAP, settings
Gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
Zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
ShX = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"]
ymc = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"]
rmc = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
       "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
       "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十", "卅一"]
XiZ = ['摩羯', '水瓶', '双鱼', '白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手']
WeekCn = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]

openai.api_key = settings.api_key
openai.api_base = settings.api_base

logging.basicConfig(
    format="%(asctime)s: %(levelname)s: %(name)s: %(message)s",
    level=logging.INFO
)
_logger = logging.getLogger(__name__)


def get_real_ipaddr(request: Request) -> str:
    if "x-real-ip" in request.headers:
        return request.headers["x-real-ip"]
    else:
        if not request.client or not request.client.host:
            return "127.0.0.1"

        return request.client.host


app = FastAPI(title="Chatgpt Divination API")
limiter = Limiter(key_func=get_real_ipaddr)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost",
        "http://127.0.0.1"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DivinationBofy(BaseModel):
    prompt: str
    prompt_type: str
    birthday: str


@app.post("/api/divination")
@limiter.limit(settings.rate_limit)
async def chatgpt(request: Request, divination_body: DivinationBofy):
    _logger.info(
        f"Request from {get_real_ipaddr(request)}, prompt_type={divination_body.prompt_type}, prompt={divination_body.prompt}"
    )
    if divination_body.prompt_type == "tarot" and len(divination_body.prompt) > 100:
        raise HTTPException(status_code=400, detail="Prompt too long")
    elif divination_body.prompt_type == "name" and (len(divination_body.prompt) > 10 or len(divination_body.prompt) < 1):
        raise HTTPException(status_code=400, detail="姓名长度错误")
    elif divination_body.prompt_type == "name":
        divination_body.prompt = f"我的名字是{divination_body.prompt}"
    elif divination_body.prompt_type == "birthday":
        birthday = datetime.datetime.strptime(
            divination_body.birthday, '%Y-%m-%d %H:%M:%S'
        )
        divination_body.prompt = f"我的生日是{birthday.year}年{birthday.month}月{birthday.day}日{birthday.hour}时{birthday.minute}分{birthday.second}秒"
    response = openai.ChatCompletion.create(
        model=settings.model,
        max_tokens=1000,
        temperature=0.9,
        top_p=1,
        messages=[
            {
                "role": "system",
                "content": PROMPT_MAP[divination_body.prompt_type]
            },
            {"role": "user", "content": divination_body.prompt},
        ]
    )
    return response['choices'][0]['message']['content']


@app.get("/api/date")
async def change_date(request: Request, date: str, is_lunar: bool = False):
    if is_lunar:
        # 从农历年月日获取一天的信息
        day = sxtwl.fromLunar(2020, 12, 1)
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
        ymc[lunar_date.getLunarMonth()],
        rmc[lunar_date.getLunarDay()],
        XiZ[lunar_date.getConstellation()]
    )


@app.get("/")
async def read_index(request: Request):
    _logger.info(f"Request from {get_real_ipaddr(request)}")
    return FileResponse(
        "dist/index.html",
        headers={"Cache-Control": "no-cache"}
    )


app.mount("/", StaticFiles(directory="dist"), name="static")


@app.exception_handler(Exception)
async def exception_handler(request: Request, exc: Exception):
    return PlainTextResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=f"Internal Server Error: {exc}",
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
