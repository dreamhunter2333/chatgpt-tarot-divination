import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, INT

from config import settings

Base = declarative_base()
engine = create_engine(f"sqlite:///{settings.db_path}")
DBSession = sessionmaker(bind=engine)
_logger = logging.getLogger(__name__)


class User(Base):
    __tablename__ = 'user'

    id = Column(INT, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True, unique=True)
    password = Column(String(255), nullable=False)
    usage = Column(INT, default=0)
    limit = Column(INT, default=settings.default_limit)


Base.metadata.create_all(engine)
