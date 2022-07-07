from utils import AbstractErrorWithTemplate


class ValidatorError(Exception):
    """Base error class for wtforms custom validators."""


class ProxyValidatorError(ValidatorError):
    """Base error class for proxy validators."""


class MissingDefaultOriginalValidatorError(ProxyValidatorError, AbstractErrorWithTemplate):
    """Error related to incorrectness of default validator in a proxy."""

    message_teamplates = {
        "default": "To initialize a proxy validator without an initial input, the class \"{proxy_class_name}\" must have a default validator."
    }
