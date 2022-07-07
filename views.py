from typing import Optional

from flask import Blueprint, render_template, redirect, url_for, flash, abort, request
from flask_login import login_required, current_user

from forms.utils import get_all_errors_from_form
from forms import RegistrationForm, AuthorizationForm, ProfileSettingsForm
from services.account_services import *
from models import User
from errors.service_errors import AccountServiceError


login_manager.login_view = "views.authorization"
view_blueprint = Blueprint('views', __name__)


@view_blueprint.route('/')
def main_page():
    return render_template("main-page.html", user=current_user)


@view_blueprint.route('/policy')
def policy():
    return render_template("policy-page.html")


@view_blueprint.route("/registration", methods=('GET', 'POST'))
def registration():
    form = RegistrationForm()

    if form.validate_on_submit():
        try:
            register_user(
                official_username=form.official_username.data,
                email=form.email.data,
                password=form.password.data
            )

            if current_user.is_anonymous:
                authorize_user(form.official_username.data, form.password.data)

            return redirect(url_for("views.main_page"))

        except AccountServiceError as error:
            flash(str(error), category="additional errors")

    return render_template(
        "form-pages/registration-page.html",
        form=form,
        error_by_field_id=get_all_errors_from_form(form)
    )


@view_blueprint.route("/login", methods=('GET', 'POST'))
def authorization():
    form = AuthorizationForm()

    if form.validate_on_submit():
        try:
            authorize_user(form.login.data, form.password.data)

            return redirect(url_for("views.profile"))

        except AccountServiceError as error:
            flash(str(error), category="additional errors")

    return render_template(
        "form-pages/authorization-page.html",
        form=form,
        error_by_field_id=get_all_errors_from_form(form)
    )


@view_blueprint.route("/logout")
@login_required
def logout():
    flash(
        f"You are logged out of your account \"{current_user.official_username}\"",
        category="alert_messages"
    )

    logout_user()
    return redirect(url_for("views.main_page"))


@view_blueprint.route("/users/<string:official_username>")
def user_catalog(official_username):
    found_user = User.query.filter_by(official_username=official_username).first_or_404()

    return render_template(
        "profile-page.html",
        current_account_belongs_to_current_user=current_user.get_id() == found_user.get_id(),
        user=found_user
    )


@view_blueprint.route("/profile")
@login_required
def profile():
    return render_template(
        "profile-page.html",
        current_account_belongs_to_current_user=True,
        user=current_user
    )


@view_blueprint.route("/settings/profile", methods=("GET", "POST"))
@login_required
def change_profile():
    form = ProfileSettingsForm()

    if form.validate_on_submit():
        update_profile_data(
            public_username=form.public_username.data,
            user_description=form.user_description.data,
            blob_user_icon=form.user_icon.data.read()
        )

        return redirect(url_for("views.profile"))

    return render_template(
        "form-pages/change-profile-page.html",
        form=form,
        error_by_field_id=get_all_errors_from_form(form),
        user=current_user
    )


@view_blueprint.app_errorhandler(404)
def not_found_handler(error: Optional[Exception]):
    return render_template("error-pages/not-found-page.html"), 404


@view_blueprint.before_request
def before_request():
    if (
        request.method == "GET" and
        not current_user.is_anonymous and
        not current_user.is_email_confirmed
    ):
        flash(
            "Your email has not been verified. Confirm it in account settings",
            category="alert_messages"
        )
