from flask import Flask, render_template, request, url_for, flash, get_flashed_messages, make_response, redirect, g, session
from werkzeug.security import generate_password_hash

from database_managers import *


app = Flask(__name__)
app.config.from_object("config")


def get_db_manager() -> DataBaseManager:
    return app.config["DATABASE_MANAGER"](app.config["DATABASE"])


@app.route("/")
def index():
    return render_template("index.html", login_happened=False)


@app.route("/authorization", methods=["POST", "GET"])
def authorization():
    if request.method == "POST":
        return redirect(url_for("account", user_name=request.form["accountName"])) #for a test

    return render_template("authorization.html")


@app.route("/registration", methods=["POST", "GET"])
def registration():
    if request.method == "POST":
        g.db_manager = get_db_manager()
        g.db_manager.connect()

        nitpicking_of_overseer = tuple(filter(
            lambda response: not response.sign,
            (
                app.config["OVERSEER_FOR_DATA"].is_username_correct(request.form["accountName"]),
                app.config["OVERSEER_FOR_DATA"].is_user_email_correct(request.form["accountEmail"]),
                app.config["OVERSEER_FOR_DATA"].is_user_password_correct(request.form["originalPassword"])
            )
        ))

        if nitpicking_of_overseer:
            result_message = nitpicking_of_overseer[0].message
        elif request.form["originalPassword"] != request.form["confirmPassword"]:
            result_message = "Password mismatch"
        elif len(g.db_manager.get_info_from("users", email=request.form["accountEmail"])) > 0:
            result_message = "An account with this email already exists :("
        elif not request.form["isAgree"]:
            result_message = "To register, you must agree to our policy"
        else:
            result_message = f"User {request.form['accountName']} is registered!"
            g.db_manager.add_user(name=request.form["accountName"], email=request.form["accountEmail"], password=generate_password_hash(request.form["originalPassword"]))

        flash(result_message, category="registration_result")

    response = make_response(render_template("registration.html"))

    return response


@app.route("/password-recovery")
def password_recovery():
    return render_template("password-recovery.html")


@app.route("/users/<string:user_name>")
def account(user_name):
    return render_template("profile.html", user_name=user_name)


@app.teardown_appcontext
def close_db(error):
    if hasattr(g, "db_manager"):
        if g.db_manager.is_connected:
            g.db_manager.close()


@app.errorhandler(404)
def not_found_handler(error):
    return render_template("not-found.html"), 404


if __name__ == "__main__":
      app.run()
