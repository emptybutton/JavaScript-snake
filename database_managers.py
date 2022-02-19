from functools import wraps

import sqlite3


class DataBaseManager:
    """Abstract layer abstract class for non-abstract database manipulations expressed"""

    def __init__(self, database_root: str):
        self.database_root = database_root
        self.__is_connected = False

    def connect(self):
        self.__is_connected = True

    def close(self):
        self.__is_connected = False

    @staticmethod
    def for_connection_state(state):
        def decorator(method):
            @wraps(method)
            def body(self, *args, **kwargs):
                if self.is_connected != state:
                    raise ValueError ("need connection to database" if state else "need to disconnect from database")

                return method(self, *args, **kwargs)

            return body
        return decorator

    @property
    def is_connected(self):
        return self.__is_connected


class IUserManipulator:
    def add_user(self, **kwargs): pass

    def delete_user(self): pass


class ITableManipulator:
    def get_columns_from(self, table: str, **atributes) -> tuple: pass

    def get_names_of_poles_from(self, table: str) -> tuple: pass


class SQLiteManager(DataBaseManager, IUserManipulator, ITableManipulator):
    @DataBaseManager.for_connection_state(False)
    def connect(self):
        super().connect()
        self.__connections = sqlite3.connect(self.database_root)

    @DataBaseManager.for_connection_state(True)
    def close(self):
        super().close()
        self.__connections.close()

    @DataBaseManager.for_connection_state(True)
    def add_user(self, **kwargs):
        cursor = self.__connections.cursor()
        cursor.execute(f"""INSERT INTO users({', '.join(list(kwargs.keys()))}) VALUES({', '.join(['?']*len(kwargs.values()))})""", list(kwargs.values()))

        self.__connections.commit()

    @DataBaseManager.for_connection_state(True)
    def delete_user(self): pass

    @DataBaseManager.for_connection_state(True)
    def get_info_from(self, table: str, **atributes) -> tuple:
        keys = self.get_names_of_poles_from(table)
        data = self.get_columns_from(table, **atributes)
        structured_data = []

        template = dict.fromkeys(keys)

        for user_index in range(len(data)):
            structured_data.append({keys[i]: data[user_index][i] for i in range(len(template))})

        return tuple(structured_data)

    @DataBaseManager.for_connection_state(True)
    def get_columns_from(self, table: str, **atributes) -> tuple:
        cursor = self.__connections.cursor()
        cursor.execute(f"SELECT * FROM {table}" + (f" WHERE {', '.join([f'{key} = ?' for key in tuple(atributes)])}" if len(atributes) > 0 else ""), tuple(atributes.values()))

        return tuple(cursor.fetchall())

    @DataBaseManager.for_connection_state(True)
    def get_names_of_poles_from(self, table: str) -> tuple:
        cursor = self.__connections.cursor()
        cursor.execute(f"""PRAGMA table_info({table})""")

        return tuple(map(lambda item: item[1], cursor.fetchall()))
