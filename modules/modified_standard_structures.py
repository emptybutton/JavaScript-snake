class CustomDictionary(dict):
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}{dict(self)}"


class SafeDictionary(CustomDictionary):
    def __init__(self, default_value: any = None, *args, **kwargs):
        self["default_value"] = default_value
        super().__init__(*args, **kwargs)

    def __getitem__(self, key: any) -> any:
        return super().__getitem__(key) if key in self.keys() else self["default_value"]


class DeeplyUpdatedDictionary(CustomDictionary):
    def update(self, other: dict) -> None:
        if any(filter(lambda item: isinstance(item[1], dict) and item[0] in self.keys() and isinstance(self[item[0]], dict), other.items())):
            self.__recursive_update(self, other)
        else:
            super().update(other)

    def __recursive_update(self, some_dict: dict, dict_of_new_values: dict) -> None:
        keys_of_unnecessary_new_values = set()

        for key, value in dict_of_new_values.items():
            if isinstance(value, dict) and key in some_dict.keys() and isinstance(some_dict[key], dict):
                self.__recursive_update(some_dict[key], dict_of_new_values[key])
                keys_of_unnecessary_new_values.add(key)

        for unnecessary_key in keys_of_unnecessary_new_values:
            del dict_of_new_values[unnecessary_key]

        if dict_of_new_values:
            some_dict.update(dict_of_new_values)
