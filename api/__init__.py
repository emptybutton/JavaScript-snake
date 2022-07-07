from flask import Blueprint
from flask_restful import Api

from api.resources import *


api_blueprint = Blueprint("api", __name__)

api = Api(api_blueprint)

api.add_resource(UserData, "/user-data/<string:official_username>")
api.add_resource(UserIcon, "/user-icon/<string:official_username>")
api.add_resource(RandomUserIcon, "/random-user-icon")
