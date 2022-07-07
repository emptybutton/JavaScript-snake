from abc import ABC
from dataclasses import dataclass
from enum import Enum, auto, unique
from typing import Callable, Iterable

from flask import Response


token = template = str


class AbstractErrorWithTemplate(ABC, Exception):
    """
    Empty base error class that stores message templates for
    create_error_by_message_template function.
    """

    message_teamplates: dict[token, template] = dict()


def create_error_by_message_template(
    error_type: type,
    template_token: any = "default",
    *args_for_formatting,
    **kwargs_for_formatting
) -> Exception:
    """
    Creates an exception of the input error type with text from the values of
    the text_teamplates dictionary of input error type. If the template token is
    not specified, takes the template by the key "default".

    Formats a template by *args and **kwargs
    """

    return error_type(
        error_type.message_teamplates[template_token].format(
            *args_for_formatting,
            **kwargs_for_formatting
        )
    )


@dataclass(frozen=True)
class ASCIIRange:
    start: int = 0
    end: int = 127
    step: int = 1

    def __post_init__(self):
        if self.step == 0:
            raise ValueError("step must not be zero")

    def __iter__(self) -> iter:
        return iter(
            (chr(symbol_index) for symbol_index in range(self.start, self.end, self.step))
        )


def format_enumeration(items: Iterable, stay_and: bool = True) -> str:
    items = list(map(str, items))

    if len(items) >= 2 and stay_and:
        items[-2] = " and ".join(items[-2:])
        items.pop(-1)

    return ", ".join(items)


@unique
class ComparisonResult(Enum):
    more = auto()
    equal = auto()
    less = auto()


def compare_points_by_coordinates(
    target_point: Iterable[int | float],
    *comparison_points: tuple[Iterable[int | float]]
) -> Iterable[tuple[ComparisonResult]]:
    for comparison_point in comparison_points:
        yield tuple(map(
            lambda target_coordinate, comparison_coordinate: (
                ComparisonResult.equal if target_coordinate == comparison_coordinate
                else {
                    True: ComparisonResult.more,
                    False: ComparisonResult.less
                }[target_coordinate < comparison_coordinate]
            ),
            target_point,
            comparison_point
        ))


def get_without_investment_from(collection: Iterable) -> list:
    wide = list()

    for item in collection:
        if isinstance(item, Iterable):
            wide.extend(get_without_investment_from(item))
        else:
            wide.append(item)

    return wide
