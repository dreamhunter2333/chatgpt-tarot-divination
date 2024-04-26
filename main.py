import logging
import uvicorn

from src.app import app
from src.config import settings

logging.basicConfig(
    format="%(asctime)s: %(levelname)s: %(name)s: %(message)s",
    level=logging.INFO
)
_logger = logging.getLogger(__name__)

_logger.info(f"settings: {settings.model_dump_json(indent=2)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
