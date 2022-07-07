from os.path import dirname, abspath
from typing import Optional

from flask import Flask, url_for, flash

from orm import db
from models import User
from api import api_blueprint
from services.account_services import login_manager
from views import view_blueprint


app = Flask(__name__)
app.config.from_object("config")

app.register_blueprint(view_blueprint)
app.register_blueprint(api_blueprint, url_prefix="/api")

login_manager.init_app(app)
db.init_app(app)


@app.teardown_appcontext
def context_closure(error: Optional[Exception]):
    if error is None:
        db.session.commit()
    else:
        db.session.rollback()


if __name__ == "__main__":
    app.run(port=8000)
