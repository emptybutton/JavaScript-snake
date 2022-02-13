from flask import Flask, render_template

app = Flask(__name__)
app.config.from_object("config")

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/login")
@app.route("/authorization")
def registration():
    return render_template("authorization.html")


@app.route("/registration")
def login():
    return render_template("registration.html")


@app.route("/password-recovery")
def password_recovery():
    return render_template("password-recovery.html")


@app.route("/profile")
def account():
    return render_template("profile.html")


if __name__ == "__main__":
      app.run()
