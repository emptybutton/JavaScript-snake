from os import path
import secrets

from database_managers import SQLiteManager
from data_overseers import MainOverseer


DEBUG = True
SECRET_KEY = secrets.token_hex()
DATABASE = path.abspath("databases/main-base.db")
DATABASE_MANAGER = SQLiteManager
OVERSEER_FOR_DATA = MainOverseer()
