from orm import db
from flask_login import UserMixin


class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    official_username = db.Column(db.String(64), nullable=False, unique=True)
    password_hash = db.Column(db.String(), nullable=False)
    email = db.Column(db.String, unique=True)
    is_email_confirmed = db.Column(db.Integer(), default=0, nullable=False)
    icon = db.Column(db.LargeBinary(), nullable=False)
    public_username = db.Column(db.String(32))
    description = db.Column(db.String(1024))

    def __repr__(self) -> str:
        return "{class_name}.{official_username}(id={id}, public_username={public_username})".format(
            class_name=self.__class__.__name__,
            official_username=self.official_username,
            id=self.id,
            public_username=self.public_username
        )
