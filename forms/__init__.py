from flask_wtf import FlaskForm

from forms.fields import *


class RegistrationForm(FlaskForm):
    official_username = official_username_field
    email = email_field
    password = user_password_field
    policy_checkbox = agree_to_policy_field


class AuthorizationForm(FlaskForm):
    login = official_username_field
    password = user_password_field


class ProfileSettingsForm(FlaskForm):
    public_username = public_username_field
    user_description = user_description_field
    user_icon = user_icon_field
