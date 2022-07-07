from flask_wtf import FlaskForm


def get_all_errors_from_form(form: FlaskForm) -> dict[str, str]:
    return {field.id: error for field in form._fields.values() for error in field.errors}
