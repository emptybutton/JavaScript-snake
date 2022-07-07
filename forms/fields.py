from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import StringField, PasswordField, TextAreaField, FileField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Email

from models import User
from forms.validators import (
    AvailableCharactersValidator,
    ImageSizeValidator,
    create_informative_length_validator
)
from orm.utils import get_column_data_from_model_type
from utils import ASCIIRange


official_username_field = StringField(
    "official username",
    validators=(
        DataRequired(),
        create_informative_length_validator(
            "official username",
            min=1,
            max=get_column_data_from_model_type('official_username', User).type.length
        ),
        AvailableCharactersValidator((
            *ASCIIRange(48, 58),
            *ASCIIRange(65, 91),
            *ASCIIRange(97, 123),
            '-',
            '_'
        ))
    )
)

user_password_field = PasswordField(
    'password',
    validators=(
        create_informative_length_validator("password", min=8, max=256),
        DataRequired()
    )
)

email_field = StringField('email', validators=(Email(), DataRequired()))

public_username_field = StringField(
    "public username",
    validators=(
        create_informative_length_validator(
            "public username",
            max=get_column_data_from_model_type('public_username', User).type.length
        ),
    )
)

user_description_field = TextAreaField(
    'description',
    validators=(
        create_informative_length_validator(
            'description',
            max=get_column_data_from_model_type('description', User).type.length
        ),
    )
)

user_icon_field = FileField(
    name="icon",
    validators=(
        FileAllowed(["jpeg", "jpg"], "icon must be an image in jpeg or jpg format."),
        ImageSizeValidator(min_size=(128, 128))
    )
)

agree_to_policy_field = BooleanField(validators=(DataRequired("You must agree to the policy."),))
