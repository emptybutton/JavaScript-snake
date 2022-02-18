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

    @classmethod
    def for_connection_state(cls, state):
        def decorator(method):
            @wraps(method)
            def body(self, *args, **kwargs):
                if self.is_connected != state:
                    raise TypeError ("need connection to database" if state else "need to disconnect from database")

                return method(self, *args, **kwargs)

            return body
        return decorator

    @property
    def is_connected(self):
        return self.__is_connected


class IUserManipulator:
    def add_user(**kwargs): pass

    def delete_user(): pass


class SQLiteManager(DataBaseManager, IUserManipulator):
    def connect(self):
        super().connect()
        self.__connections = sqlite3.connect(self.database_root)


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
