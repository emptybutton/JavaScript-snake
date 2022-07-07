from abc import ABC, abstractmethod
from typing import Callable, Iterable, Optional
from math import inf
from io import BytesIO

from PIL import Image
from wtforms import Form, Field, ValidationError
from wtforms.validators import Length

from errors.validator_errors import MissingDefaultOriginalValidatorError
from utils import (
    create_error_by_message_template,
    compare_points_by_coordinates,
    ComparisonResult,
    get_without_investment_from
)


def create_informative_length_validator(field_name: str, min=0, max=inf) -> Length:
    if min <= 0:
        message_condition = f"less than {inf}"
    elif max == inf:
        message_condition = f"more than {inf}"
    else:
        message_condition =  f"between {min} and {max}"

    return Length(min=min, max=max, message=f"{field_name} length must be {message_condition}.".capitalize())


class IWTFormsValidator(ABC):
    @abstractmethod
    def __call__(self, form: Form, field: Field) -> None:
        pass


class ProxyValidator(IWTFormsValidator):
    """
    A proxy validator that processes the input field when called by creating a
    new field based on the old input.
    """

    default_original_validator: Optional[Callable] = None

    def __init__(self, original_validator: Optional[Callable] = None):
        if original_validator is None:
            if self.default_original_validator is None:
                raise create_error_by_message_template(
                    MissingDefaultOriginalValidatorError,
                    proxy_class_name=self.__class__.__name__
                )

            original_validator = self.default_original_validator

        self.original_validator = original_validator

    def __call__(self, form: Form, field: Field) -> any:
        return self.original_validator(
            form,
            field
        )


class AvailableCharactersValidator(IWTFormsValidator):
    def __init__(
        self,
        available_characters: Iterable[str],
        message="{line_name} has extra characters: {extra_characters}"
    ):
        self.available_characters = available_characters
        self.message = message

    def __call__(self, form: Form, field: Field) -> None:
        extra_characters = frozenset(field.data) - self.available_characters

        if extra_characters:
            raise ValidationError(
                self.message.format(
                    line_name=field.label.text.title(),
                    extra_characters=" ".join(extra_characters)
                ).capitalize()
            )

    @property
    def available_characters(self) -> frozenset:
        return self.__available_characters

    @available_characters.setter
    def available_characters(self, new_available_characters: Iterable[str]) -> None:
        self.__available_characters =  frozenset(new_available_characters)


class ImageValidator(IWTFormsValidator):
    _default_field_name = "Image"

    def __call__(self, form: Form, field: Field) -> None:
        return self._validate_image(
            self.__create_image_from_field(field),
            self._get_image_name_from_field(field)
        )

    @abstractmethod
    def _validate_image(self, image: Image, image_name: str) -> None:
        pass

    def _get_image_name_from_field(self, field: Field) -> str:
        return field.name if field.name else self._default_field_name

    def __create_image_from_field(self, field: Field) -> Image:
        image_binary_data = field.data.read()
        field.data.stream._file = BytesIO(image_binary_data)

        try:
            return Image.open(BytesIO(image_binary_data))
        except Exception:
            raise ValidationError(
                f"{self._get_image_name_from_field(field).capitalize()} is incorrect"
            )


class ImageSizeValidator(ImageValidator):
    def __init__(
        self,
        min_size: Iterable = (0, 0),
        max_size: Iterable = (inf, inf)
    ):
        self.min_size = tuple(min_size)
        self.max_size = tuple(max_size)

    def _validate_image(self, image: Image, image_name: str) -> None:
        if ComparisonResult.less in get_without_investment_from(
            compare_points_by_coordinates(self.min_size, image.size)
        ):
            raise ValidationError(f"Minimum {image_name.lower()} size is {'x'.join(map(str, self.min_size))}")

        if ComparisonResult.more in get_without_investment_from(
            compare_points_by_coordinates(self.max_size, image.size)
        ):
            raise ValidationError(f"Max {image_name.lower()} size is {'x'.join(map(str, self.max_size))}")
