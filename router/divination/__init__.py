from . import base
from . import tarot
from . import birthday
from . import name
from . import dream
from . import new_name
from . import plum_flower
from . import fate
from .base import DivinationFactory

import logging

_logger = logging.getLogger("divination factory")
_logger.info(
    f"Loaded divination types: {list(DivinationFactory.divination_map.keys())}"
)
