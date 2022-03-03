from functools import wraps

import sqlite3


class DataBaseManager:
    """Abstract layer abstract class for non-abstract database manipulations expressed"""

    def __init__(self, database_root: str):
        self.database_root = database_root
        self.__is_connected = False

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        self.disconnect()

    @staticmethod
    def for_connection_state(state: bool):
        def decorator(method):
            @wraps(method)
            def body(self, *args, **kwargs):
                if self.is_connected != state:
                    raise ValueError ("need connection to database" if state else "need to disconnect from database")

                return method(self, *args, **kwargs)

            return body
        return decorator

    def connect(self) -> None:
        self.__is_connected = True

    def disconnect(self) -> None:
        self.__is_connected = False

    def _custom_request(self, request: str) -> any: pass

    def _execute_script(self, script: str) -> any: pass

    @property
    def is_connected(self) -> bool:
        return self.__is_connected


class IColumnChanger:
    def add_column_to(self, table: str, **atributes) -> None: pass

    def change_column_value_to(self, table: str, column_name: str, value: any, **conditions) -> None: pass

    def delete_columns_from(self, table: str, **atributes) -> None: pass


class IColumnSupplier:
    def get_info_from(self, table: str, **atributes) -> tuple[dict]: pass

    def get_names_of_poles_from(self, table: str) -> tuple[str]: pass

    def get_columns_from(self, table: str, **atributes) -> tuple[str]: pass


class SQLiteManager(DataBaseManager, IColumnChanger, IColumnSupplier):
    @DataBaseManager.for_connection_state(False)
    def connect(self) -> None:
        super().connect()
        self.__connections = sqlite3.connect(self.database_root)

    @DataBaseManager.for_connection_state(True)
    def disconnect(self) -> None:
        super().disconnect()
        self.__connections.close()

    @DataBaseManager.for_connection_state(True)
    def _custom_request(self, request: str, data: tuple = tuple()) -> tuple:
        cursor = self.__connections.cursor()
        cursor.execute(request, data)

        self.__connections.commit()

        return tuple(cursor.fetchall())

    @DataBaseManager.for_connection_state(True)
    def _execute_script(self, script: str) -> tuple:
        return tuple(map(self._custom_request, script.split(";")))

    @DataBaseManager.for_connection_state(True)
    def get_info_from(self, table: str, **atributes) -> tuple[dict]:
        return self.__convert_to(self.get_columns_from(table, **atributes), self.get_names_of_poles_from(table))

    @DataBaseManager.for_connection_state(True)
    def get_names_of_poles_from(self, table: str) -> tuple:
        return tuple(map(lambda item: item[1], self._custom_request(f"""PRAGMA table_info({table})""")))

    @DataBaseManager.for_connection_state(True)
    def get_columns_from(self, table: str, **atributes) -> tuple:
        return tuple(self._custom_request(f"SELECT * FROM {table} {self.__create_sqlite_condition_from(atributes.keys())}", tuple(atributes.values())))

    @DataBaseManager.for_connection_state(True)
    def add_column_to(self, table: str, **atributes) -> None:
        self._custom_request(f"""INSERT INTO {table}({', '.join(list(atributes.keys()))}) VALUES({', '.join(['?']*len(atributes.values()))})""", tuple(atributes.values()))

    @DataBaseManager.for_connection_state(True)
    def change_column_value_to(self, table: str, column_name: str, value: any, **conditions) -> None:
        data = [value]
        data.extend(conditions.values())
        self._custom_request(f"UPDATE {table} SET {column_name} = ? {self.__create_sqlite_condition_from(conditions.keys())}", data)

    @DataBaseManager.for_connection_state(True)
    def delete_columns_from(self, table: str, **atributes) -> None:
        self._custom_request(f"DELETE FROM {table} {self.__create_sqlite_condition_from(atributes.keys())}", tuple(atributes.values()))

    def __convert_to(self, values: tuple, format: tuple):
        template = dict.fromkeys(format)
        return tuple([{format[i]: values[user_index][i] for i in range(len(template))} for user_index in range(len(values))])

    def __create_sqlite_condition_from(self, conditions: list[str]):
        return f"WHERE {' and '.join([f'{key} = ?' for key in tuple(conditions)])}" if len(conditions) > 0 else ""
