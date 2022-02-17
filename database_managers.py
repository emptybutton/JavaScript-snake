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
            def body(self, *args, **kwargs):
                if self.is_connected != state:
                    raise TypeError ("need connection to database" if state else "need to disconnect from database")

                return method(*args, **kwargs)

            return body
        return decorator

    @property
    def is_connected(self):
        return self.__is_connected


class IUserManipulator:
    def add_user(): pass

    def delete_user(): pass


