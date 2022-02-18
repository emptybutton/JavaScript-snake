from math import inf as infinity

import validators


class Overseer:
    """An abstract class responsible for the correctness of data implemented through interfaces and storing their configuration"""


class IOverseer:
    """Interface containing methods for determining data correctness and their default configuration"""


class IUserDataOverseer(IOverseer):
    USERNAME_SIZE = [1, infinity]
    USER_EMAIL_SIZE = [1, infinity]
    USER_PASSWORD_SIZE = [1, infinity]
    FORBIDDEN_LETTERS_FOR_USER_URL = []

    def is_username_correct(self, username) -> bool:
        return validators.length(username, min=self.USERNAME_SIZE[0], max=self.USERNAME_SIZE[1])

    def is_user_email_correct(self, user_email) -> bool:
        return all([validators.email(user_email), validators.length(user_email.split("@")[0], min=self.USER_EMAIL_SIZE[0], max=self.USER_EMAIL_SIZE[1])])

    def is_user_password_correct(self, user_password) -> bool:
        return validators.length(user_password, min=self.USER_PASSWORD_SIZE[0], max=self.USER_PASSWORD_SIZE[1])

    def is_user_url_correct(self, user_url) -> bool:
        return all(map(lambda letter: not letter in self.FORBIDDEN_LETTERS_FOR_USER_URL, user_url))


class MainOverseer(Overseer, IUserDataOverseer):
    USER_PASSWORD_SIZE = [4, infinity]
