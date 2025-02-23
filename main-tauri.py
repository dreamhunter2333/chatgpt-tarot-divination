import logging
import os
import signal
import sys
import threading
import uvicorn

from src.app import app
from src.config import settings

logging.basicConfig(
    format="%(asctime)s: %(levelname)s: %(name)s: %(message)s",
    level=logging.INFO
)
_logger = logging.getLogger(__name__)
_logger.info(f"settings: {settings.model_dump_json()}")


def stdin_loop():
    _logger.info("[sidecar] Waiting for commands...")
    while True:
        user_input = sys.stdin.readline().strip()
        match user_input:
            case "sidecar shutdown":
                _logger.info("[sidecar] Received 'sidecar shutdown' command.")
                os.kill(os.getpid(), signal.SIGINT)
            case _:
                _logger.info(
                    f"[sidecar] Invalid command [{user_input}]. Try again."
                )


def start_input_thread():
    try:
        input_thread = threading.Thread(target=stdin_loop)
        input_thread.daemon = True  # so it exits when the main program exits
        input_thread.start()
    except Exception as e:
        _logger.exception("[sidecar] Failed to start input handler.", e)


if __name__ == "__main__":
    start_input_thread()
    uvicorn.run(app, port=12333)
