import logging
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


def stdin_loop(server: uvicorn.Server):
    _logger.info("[sidecar] Waiting for commands...")
    while True:
        line = sys.stdin.readline()
        # EOF means the tauri app is gone (crash or force quit), exit instead of spinning
        if not line:
            _logger.info("[sidecar] stdin closed, shutting down.")
            # uvicorn honours this flag even before startup completes, unlike a signal
            server.should_exit = True
            return
        user_input = line.strip()
        match user_input:
            case "sidecar shutdown":
                _logger.info("[sidecar] Received 'sidecar shutdown' command.")
                server.should_exit = True
                return
            case _:
                _logger.info(
                    f"[sidecar] Invalid command [{user_input}]. Try again."
                )


def start_input_thread(server: uvicorn.Server):
    try:
        input_thread = threading.Thread(target=stdin_loop, args=(server,))
        input_thread.daemon = True  # so it exits when the main program exits
        input_thread.start()
    except Exception as e:
        _logger.exception("[sidecar] Failed to start input handler.", e)


if __name__ == "__main__":
    # the tauri app passes a free port picked at launch, 12333 keeps standalone runs working
    port = int(sys.argv[sys.argv.index("--port") + 1]) if "--port" in sys.argv else 12333
    # cap the wait for in-flight streams, otherwise quitting mid divination keeps the sidecar alive
    server = uvicorn.Server(uvicorn.Config(app, port=port, timeout_graceful_shutdown=3))
    start_input_thread(server)
    server.run()
