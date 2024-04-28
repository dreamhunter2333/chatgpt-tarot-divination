
from src.models import DivinationBody
from typing import Optional


class MetaDivination(type):

    divination_map = {}

    def __init__(cls, name, bases, attrs):
        super().__init__(name, bases, attrs)
        if hasattr(cls, 'divination_type'):
            MetaDivination.divination_map[cls.divination_type] = cls


class DivinationFactory(metaclass=MetaDivination):

    @staticmethod
    def get(divination_type: str) -> Optional["DivinationFactory"]:
        cls = MetaDivination.divination_map.get(divination_type)
        if cls is None:
            return
        return cls()

    def build_prompt(self, divination_body: DivinationBody) -> tuple[str, str]:
        return '', ''
