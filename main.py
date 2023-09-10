import os
import logging
import uvicorn

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from router.limiter import limiter, get_real_ipaddr
from router.date_router import router as date_router
from router.chatgpt_router import router as chatgpt_router
from router.user_router import router as user_router


_logger = logging.getLogger(__name__)

app = FastAPI(title="Chatgpt Divination API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

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

app.include_router(date_router)
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


@app.exception_handler(Exception)
async def exception_handler(request: Request, exc: Exception):
    return PlainTextResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=f"Internal Server Error: {exc}",
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
