from os import path
import secrets

from database_managers import SQLiteManager


DEBUG = True
SECRET_KEY = secrets.token_hex()
DATABASE = path.abspath("databases/main-base.db")
DATABASE_MANAGER = SQLiteManager
