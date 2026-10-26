import os
import logging

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, FileResponse, JSONResponse

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


@app.get("/health")
async def health():
    return "ok"


if os.path.exists("dist"):
    dist_root = os.path.realpath("dist")

    @app.get("/{path:path}")
    async def read_index(path: str, request: Request):
        file_path = os.path.realpath(os.path.join(dist_root, path))
        if path and file_path.startswith(dist_root + os.sep) and os.path.isfile(file_path):
            return FileResponse(file_path)
        # a missing asset must not be answered with html, that only hides the error
        if path.startswith("assets/"):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        # fall back to index.html so client side routes survive a reload
        _logger.info(f"Request from {get_real_ipaddr(request)}")
        return FileResponse(
            os.path.join(dist_root, "index.html"),
            headers={"Cache-Control": "no-cache"}
        )


@app.exception_handler(Exception)
async def exception_handler(request: Request, exc: Exception):
    """全局异常处理器"""
    # 记录详细错误日志用于调试
    _logger.error(
        f"Unhandled exception: {exc}",
        exc_info=True,
        extra={
            "request_path": request.url.path,
            "request_method": request.method,
            "client_ip": get_real_ipaddr(request)
        }
    )

    # 直接返回原始错误信息
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": str(exc)
        },
    )
