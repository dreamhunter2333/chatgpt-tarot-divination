import openai
import logging
import uvicorn

from fastapi import FastAPI, Form, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from config import PROMPT, settings

openai.api_key = settings.api_key
openai.api_base = settings.api_base

logging.basicConfig(
    format="%(asctime)s: %(levelname)s: %(name)s: %(message)s",
    level=logging.INFO
)

app = FastAPI(title="Chatgpt Tarot Divination API")
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://127.0.0.1"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@ app.post("/chatgpt")
@ limiter.limit(settings.rate_limit)
async def chatgpt(request: Request, prompt: str = Form()):
    if len(prompt) > 100:
        raise HTTPException(status_code=400, detail="Prompt too long")
    response = openai.ChatCompletion.create(
        model=settings.model,
        max_tokens=1000,
        temperature=0.9,
        top_p=1,
        messages=[
            {"role": "system", "content": PROMPT},
            {"role": "user", "content": prompt},
        ]
    )
    return response['choices'][0]['message']['content']


@app.get("/")
async def read_index():
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
