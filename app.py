from flask import Flask, render_template, request, url_for, flash, get_flashed_messages
import validators

app = Flask(__name__)
app.config.from_object("config")


@app.route("/")
def index():
    return render_template("index.html", login_happened=False)


@app.route("/authorization", methods=["POST", "GET"])
def registration():
    return render_template("authorization.html")


@app.route("/registration", methods=["POST", "GET"])
def login():
    if request.method == "POST": ...
    flash("There will be a error", category="error")
    
    return render_template("registration.html")


@app.route("/password-recovery")
def password_recovery():
    return render_template("password-recovery.html")


@app.route("/users/<user_name>")
def account(user_name):
    return render_template("profile.html", user_name=user_name)


@app.errorhandler(404)
def not_found_handler(error):
    return render_template("not-found.html")


if __name__ == "__main__":
      app.run()
