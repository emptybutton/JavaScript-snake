from math import inf as infinity

from functions_ import get_all_parents_of, get_all_children_of
from data_overseer_intefaces import *


class DataOverseer:
    """Abstract class that validates data based on the criteria of its config"""

    def __init__(self, themes_data: dict = dict()):
        self.theme_data = DeeplyUpdatedDictionary()
        self.fulfill_all_class_requirements()

        self.theme_data.update(themes_data)

    def fulfill_all_class_requirements(self) -> None:
        for requirements_fulfillment_function in {
            prototype.fulfill_requirements
            for prototype in (self.__class__, *get_all_parents_of(self.__class__))[::-1]
                if hasattr(prototype, "fulfill_requirements")
        }:
            requirements_fulfillment_function(self)

    @staticmethod
    def fulfill_requirements(object_: object) -> None:
        """Static method that changes the entered config for the state of an object of its class"""


class UserDataOverseer(DataOverseer, IEmailOverseer, IURLOverseer, *get_all_children_of(ITextOverseer)):
    @staticmethod
    def fulfill_requirements(object_: object) -> None:
        object_.theme_data.update(
            {
                "username": {"url_verification": None},
                "email": {"email_verification": None},
                "public username": {},
                "password": {}
            }
        )

        object_.check_for_correct_url_as.data_preparation_functions["username"] = lambda url: f"http://{url}.xyz"
