import os

from flask import *
from werkzeug.security import generate_password_hash, check_password_hash
from random import choice

from modules.database_managers import *


app = Flask(__name__)
app.config.from_object("config")


def get_db_manager() -> DataBaseManager:
    return app.config["PROTOTYPE_OF_DATABASE_MANAGER"](app.config["DATABASE"])


def initialise_database():
    os.makedirs(os.path.dirname(app.config["DATABASE"]))

    with open(app.config["DATABASE"], "w"):
        with get_db_manager() as manager:
            with open("static/sql/initialise_database.sql") as sql_file:
                manager._execute_script(sql_file.read())


@app.route("/")
def main_page():
    return render_template("index.html")


@app.route("/authorization", methods=["POST", "GET"])
def authorization():
    if request.method == "POST":
        g.db_manager = get_db_manager()
        g.db_manager.connect()

        discover_login = "email" if app.config["OVERSEER_FOR_DATA"].is_user_email_correct(request.form["login"]).sign else "url"

        for user in g.db_manager.get_info_from("users", **{discover_login: request.form["login"]}):
            if check_password_hash(user["password"], request.form["password"]):
                session["user_id"] = g.db_manager.get_info_from("users", **{discover_login: request.form["login"]})[0]["id"]

                return redirect(url_for("profile", user_login=user["url"])), 301

        flash("Check out your data!", category="denied")

    return render_template("authorization.html")


@app.route("/sign-out")
def logout():
    if "user_id" in session.keys():
        del session["user_id"]

    return redirect(url_for("index")), 301


@app.route("/registration", methods=["POST", "GET"])
def registration():
    if request.method == "POST":
        g.db_manager = get_db_manager()
        g.db_manager.connect()

        nitpicking_of_overseer = tuple(filter(
            lambda response: not response.sign,
            (
                app.config["OVERSEER_FOR_DATA"].is_user_url_correct(request.form["name"]),
                app.config["OVERSEER_FOR_DATA"].is_user_email_correct(request.form["email"]),
                app.config["OVERSEER_FOR_DATA"].is_user_password_correct(request.form["password"])
            )
        ))

        if nitpicking_of_overseer:
            result_message = nitpicking_of_overseer[0].message
        elif len(g.db_manager.get_info_from("users", url=request.form["name"])) > 0:
            result_message = "An account with this url already exists :("
        elif len(g.db_manager.get_info_from("users", email=request.form["email"])) > 0:
            result_message = "An account with this email already exists :("
        elif not request.form["isAgree"]:
            result_message = "To register, you must agree to our policy"
        else:
            result_message = f"User \"{request.form['name']}\" is registered!"
            g.db_manager.add_column_to("users", url=request.form["name"], email=request.form["email"], password=generate_password_hash(request.form["password"]))

        flash(result_message, category="registration_result")

    return render_template("registration.html")


@app.route("/password-recovery")
def password_recovery():
    return render_template("password-recovery.html")


@app.route("/users/<string:user_url>")
def profile(user_url):
    g.db_manager = get_db_manager()
    g.db_manager.connect()

    user = g.db_manager.get_info_from("users", url=user_url)
    if user:
        response = make_response(render_template("profile.html", **user[0]))
        response.headers["fuck me"] = 100
        return response
    else:
        abort(404)


@app.route("/api/user.data/<string:user_url>")
def api_for_userdata(user_url):
    g.db_manager = get_db_manager()
    g.db_manager.connect()

    data_for_client = dict()

    user_data = g.db_manager.get_info_from("users", url=user_url)
    if user_data:
        data_for_client = user_data[0]
        for unnecessary_data_keys_for_client in ("id", "password", "email", "icon"):
            data_for_client.pop(unnecessary_data_keys_for_client)

    return jsonify(data_for_client)


@app.route("/api/user.avatar/<string:user_url>")
def api_for_user_icon(user_url):
    g.db_manager = get_db_manager()
    g.db_manager.connect()

    user_data = g.db_manager.get_info_from("users", url=user_url)
    if user_data and user_data[0]["icon"]:
        response = make_response(user_data[0]["icon"])
        response.headers["Content-Type"] = "image/jpeg"

        return response

    else:
        return send_file("static/images/default-user-icon.jpeg")


@app.teardown_appcontext
def context_closure(error):
    if hasattr(g, "db_manager"):
        if g.db_manager.is_connected:
            g.db_manager.disconnect()


@app.errorhandler(404)
def not_found_handler(error):
    return render_template("not-found.html"), 404


if __name__ == "__main__":
    if not os.path.isfile(app.config['DATABASE']):
        initialise_database()

    app.run(port="1280")
