from flask import Response
from flask_restful import Resource, marshal_with, fields, abort
from flask_login import current_user

from models import User
from services.image_services import generate_blob_user_icon


class UserData(Resource):
    @marshal_with({
        "id": fields.Integer,
        "official_username": fields.String,
        "public_username": fields.String,
        "description": fields.String
    })
    def get(self, official_username: str):
        return User.query.filter_by(official_username=official_username).first_or_404()


class UserIcon(Resource):
    def get(self, official_username: str):
        return Response(
            User.query.filter_by(official_username=official_username).first_or_404().icon,
            content_type="image/jpeg"
        )


class RandomUserIcon(Resource):
    def get(self):
        return Response(generate_blob_user_icon(), content_type="image/jpeg")
