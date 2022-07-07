from typing import Optional

from flask import session
from flask_login import LoginManager, current_user, login_user as _login_user, logout_user as _logout_user
from werkzeug.security import generate_password_hash, check_password_hash

from models import User
from orm import db
from errors.service_errors import AccountAlreadyExistsError, AccountDoesntExistError, AccountAttributeError
from services.image_services import generate_blob_user_icon
from utils import format_enumeration


login_manager = LoginManager()


@login_manager.user_loader
def load_user(user_id: int) -> User:
    return User.query.get(user_id)


def register_user(official_username: str, email: str, password: str) -> None:
    already_exist_atributes: dict[str, str] = dict()

    if User.query.filter_by(official_username=official_username).all():
        already_exist_atributes["official username"] = official_username

    if User.query.filter_by(email=email).all():
        already_exist_atributes["email"] = email

    if already_exist_atributes:
        raise AccountAlreadyExistsError(
            "User with {} already exists.".format(
                format_enumeration([
                    f"{label} \"{atribute_value}\""
                    for label, atribute_value in already_exist_atributes.items()
                ])
            )
        )

    db.session.add(
        User(
            official_username=official_username,
            email=email,
            password_hash=generate_password_hash(password),
            icon=generate_blob_user_icon()
        )
    )


def authorize_user(login: str, password: str) -> None:
    found_user = User.query.filter_by(official_username=login).first()

    if not found_user:
        raise AccountDoesntExistError(f"User with official username \"{login}\" doesn't exist")

    if not check_password_hash(found_user.password_hash, password):
        raise AccountAttributeError(f"User \"{found_user.official_username}\" has a different password")

    _login_user(found_user)


def logout_user() -> None:
    _logout_user()


def update_profile_data(
    public_username: Optional[str] = None,
    user_description: Optional[str] = None,
    blob_user_icon: Optional[str] = None
) -> None:
    if current_user.is_anonymous:
        raise AccountDoesntExistError("To update public data, log in")

    if not public_username is None:
        current_user.public_username = public_username if public_username else None

    if not user_description is None:
        current_user.description = user_description if user_description else None

    if not blob_user_icon is None:
        current_user.icon = blob_user_icon
