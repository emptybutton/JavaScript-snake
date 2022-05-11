from functools import wraps

import validators

from modified_standard_structures import DeeplyUpdatedDictionary, SafeDictionary
from functions_ import get_all_methods_from, get_all_children_of
from data_overseer_exceptions import *
from data_overseer_responses import *


class IDataOverseer:
    """Interface that allows you to bind config data and data validation methods"""

    def check_data_as(self, theme: str, data: any):
        """Generator that returns the results of data checks for all criteria of the entered theme"""

        if not theme in self.theme_data.keys():
            raise NoThemeError(theme)

        if (validation_methods_for_theme := filter(
            lambda method: method.token in self.theme_data[theme].keys(),
            self.__get_all_validation_methods()
        )):
            for method in validation_methods_for_theme:
                yield method(theme, data)

    @staticmethod
    def as_validation_method_by_token(method_token: str):
        """Proxy decorator that defines a method as a validator"""

        def decorator(checking_method):
            @wraps(checking_method)
            def body(self, theme: str, data: any, *args, **kwargs) -> any:
                if not theme in self.theme_data.keys():
                    raise NoThemeError(theme)

                if not body.token in self.theme_data[theme].keys():
                    raise ThemeError(f"\"{theme}\" theme is missing a configuration with token \"{body.token}\" for method \"{body.__name__}\"")

                return checking_method(self, theme, body.data_preparation_functions[theme](data), *args, **kwargs)

            body.token = method_token
            body.data_preparation_functions = SafeDictionary(default_value=lambda data: data)

            return body
        return decorator

    def __get_all_validation_methods(self) -> filter:
        return filter(
            lambda method: hasattr(method, "token"),
            get_all_methods_from(self)
        )


class ITextOverseer(IDataOverseer):
    pass


class IDataOverseerOfLengths(ITextOverseer):
    @IDataOverseer.as_validation_method_by_token("line_length")
    def check_line_length_as(self, theme: str, line: str) -> DataOverseerResponse:
        min_length, max_length = self.theme_data[theme][self.check_line_length_as.token]

        if len(line) < min_length:
            return DataOverseerResponse(False, f"{theme} must be more than {min_length - 1} characters")

        elif len(line) > max_length:
            return DataOverseerResponse(False, f"{theme} must be less than {max_length + 1} characters")

        else:
            return DataOverseerResponse(True, f"the number of \"{theme}\" characters to be in the desired range ({min_length}; {max_length})")


class IUnnecessarySymbolOverseer(ITextOverseer):
    @IDataOverseer.as_validation_method_by_token("unnecessary_symbols")
    def check_for_unnecessary_symbols_as(self, theme: str, line: str) -> DataOverseerResponse:
        if (found_symbols := set(line) & set(self.theme_data[theme][self.check_for_unnecessary_symbols.token])):
            return DataOverseerResponse(
                False,
                "\"{theme}\" has unnecessary symbols: {unnecessary_symbols}".format(
                    theme=theme,
                    unnecessary_symbols=str(found_symbols)[1:-1].replace('\'', '')
                )
            )
        else:
            return DataOverseerResponse(True, f"There are no forbidden characters in \"{theme}\"")


class ISyntaxOverseer(IDataOverseer):
    pass


class IEmailOverseer(ISyntaxOverseer):
    @IDataOverseer.as_validation_method_by_token("email_verification")
    def check_for_correct_email_as(self, theme: str, email: str) -> DataOverseerResponse:
        if not validators.email(email):
            return DataOverseerResponse(False, f"Email is incorrect")
        else:
            return DataOverseerResponse(True, f"Email is correct")


class IURLOverseer(ISyntaxOverseer):
    @IDataOverseer.as_validation_method_by_token("url_verification")
    def check_for_correct_url_as(self, theme: str, url: str) -> DataOverseerResponse:
        if not validators.url(url):
            return DataOverseerResponse(False, f"URL is incorrect")
        else:
            return DataOverseerResponse(True, f"URL is correct")
