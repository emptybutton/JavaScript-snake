class ServiceError(Exception):
    """Base error class for custom services."""


class AccountServiceError(ServiceError):
    """Base error class for account services."""


class AccountAlreadyExistsError(AccountServiceError):
    """Error related to re-adding a user."""


class AccountDoesntExistError(AccountServiceError):
    pass


class AccountAttributeError(AccountServiceError):
    pass
