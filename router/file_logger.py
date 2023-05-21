import os
import logging
from logging.handlers import RotatingFileHandler

from config import settings

file_logger = logging.getLogger(__name__)
file_logger.setLevel(logging.INFO)

if settings.log_dir:
    file_handler = RotatingFileHandler(
        os.path.join(settings.log_dir, "divination.log"),
        maxBytes=1024*1024*1024
    )
    file_handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    file_logger.addHandler(file_handler)
