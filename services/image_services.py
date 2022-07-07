import requests

from config import ICON_GENERATOR_SERVICE_URL


def generate_blob_user_icon() -> str:
    return requests.get(f"{ICON_GENERATOR_SERVICE_URL}/random-image").content
