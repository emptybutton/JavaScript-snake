from math import inf as infinity
from functools import wraps

import validators


class Overseer:
    """An abstract class responsible for the correctness of data implemented through interfaces and storing their configuration"""


class OverseerResponse:
    """Overseer message about data correctness"""

    def __init__(self, sign: bool, message: str = ""):
        self.sign = sign
        self.message = message

    def __bool__(self) -> bool:
        return self.sign

    def __str__(self) -> str:
        return self.message


class IOverseer:
    """Interface containing methods for determining data correctness and their default configuration"""

    @staticmethod
    def default_returns_response_by(*args, **kwargs):
        def decorator(method):
            @wraps(method)
            def body(self, *method_args, **method_kwargs):
                result = method(self, *method_args, **method_kwargs)
                if result is None:
                    return OverseerResponse(*args, **kwargs)
                else:
                    return result

            return body
        return decorator


class IUserDataOverseer(IOverseer):
    USERNAME_SIZE = [1, infinity]
    USER_LOGIN_SIZE = [1, infinity]
    USER_EMAIL_SIZE = [1, infinity]
    USER_PASSWORD_SIZE = [1, infinity]
    FORBIDDEN_LETTERS_FOR_USER_LOGIN = []

    @IOverseer.default_returns_response_by(sign=True)
    def is_username_correct(self, username) -> OverseerResponse:
        if not validators.length(username, min=self.USERNAME_SIZE[0], max=self.USERNAME_SIZE[1]):
            return OverseerResponse(False, f"Name size must be in {self.USERNAME_SIZE} diopozon")

    @IOverseer.default_returns_response_by(sign=True)
    def is_user_login_correct(self, login) -> OverseerResponse:
        if not validators.length(login, min=self.USER_LOGIN_SIZE[0], max=self.USER_LOGIN_SIZE[1]):
            return OverseerResponse(False, f"Login size must be in {self.USER_LOGIN_SIZE} diopozon")

        elif not all(tuple(map(lambda letter: not letter in self.FORBIDDEN_LETTERS_FOR_USER_LOGIN, login))):
            return OverseerResponse(False, f"Login must not contain letters: {self.FORBIDDEN_LETTERS_FOR_USER_LOGIN}")

    @IOverseer.default_returns_response_by(sign=True)
    def is_user_email_correct(self, user_email) -> OverseerResponse:
        if not validators.email(user_email):
            return OverseerResponse(False, "Email is incorrect")

        elif not validators.length(user_email.split("@")[0], min=self.USER_EMAIL_SIZE[0], max=self.USER_EMAIL_SIZE[1]):
            return OverseerResponse(False, f"Email size must be in {self.USER_EMAIL_SIZE} diopozon")

    @IOverseer.default_returns_response_by(sign=True)
    def is_user_password_correct(self, user_password) -> OverseerResponse:
        if not validators.length(user_password, min=self.USER_PASSWORD_SIZE[0], max=self.USER_PASSWORD_SIZE[1]):
            return OverseerResponse(False, f"Password size must be in {self.USER_PASSWORD_SIZE} diopozon")

class MainOverseer(Overseer, IUserDataOverseer):
    USER_PASSWORD_SIZE = [4, infinity]
