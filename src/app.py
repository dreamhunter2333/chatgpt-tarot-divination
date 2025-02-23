import os
import logging

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from src.limiter import get_real_ipaddr
from src.chatgpt_router import router as chatgpt_router
from src.user_router import router as user_router


_logger = logging.getLogger(__name__)

app = FastAPI(title="Chatgpt Divination API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chatgpt_router)
app.include_router(user_router)

if os.path.exists("dist"):
    @app.get("/")
    @app.get("/login/{path}")
    async def read_index(request: Request):
        _logger.info(f"Request from {get_real_ipaddr(request)}")
        return FileResponse(
            "dist/index.html",
            headers={"Cache-Control": "no-cache"}
        )

    app.mount("/", StaticFiles(directory="dist"), name="static")


@app.get("/health")
async def health():
    return "ok"


@app.exception_handler(Exception)
async def exception_handler(request: Request, exc: Exception):
    return PlainTextResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=f"Internal Server Error: {exc}",
    )
