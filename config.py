from secrets import token_hex


DEBUG = True
PRESERVE_CONTEXT_ON_EXCEPTION = False
SECRET_KEY = token_hex()

SQLALCHEMY_DATABASE_URI = "sqlite:///databases/main-base.db"
SQLALCHEMY_TRACK_MODIFICATIONS = False

ICON_GENERATOR_SERVICE_URL = "http://127.0.0.1:8010" # Search here https://github.com/TheArtur128/Abstract-Image-Generator
