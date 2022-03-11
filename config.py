from os import path
import secrets

from modules.database_managers import SQLiteManager
from modules.data_overseers import MainOverseer


DEBUG = True
SECRET_KEY = secrets.token_hex()

DATABASE_PATH = path.abspath("databases/main-base.db")
PROTOTYPE_OF_DATABASE_MANAGER = SQLiteManager
OVERSEER_FOR_DATA = MainOverseer()
