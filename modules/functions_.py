def get_all_parents_of(class_: object) -> list:
    """Returns all parents of the input class starting with the nearest one"""

    return atomize(lambda class_: list(class_.__bases__), class_)


def get_all_children_of(class_: object) -> list:
    """Returns all children of the input class starting with the nearest one"""

    return atomize(lambda class_: list(class_.__subclasses__()), class_)


def atomize(func_, something: any) -> list:
    found = func_(something)
    were_new_added = True

    if object in found:
        found.remove(object)

    while were_new_added:
        new_elements = []
        were_new_added = False

        for element in found:
            for new_level_element in func_(element):
                if not new_level_element in found + new_elements:
                    new_elements.append(new_level_element)
                    were_new_added = True

        found.extend(new_elements)

    return found


def get_all_methods_from(object_: object) -> filter:
    return filter(
        callable,
        map(
            lambda item_name: getattr(object_, item_name),
            filter(lambda item_name: "__" != item_name[:2], dir(object_))
        )
    )
