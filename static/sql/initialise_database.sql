DROP TABLE IF EXISTS users;
CREATE TABLE users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  login TEXT NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  self_description TEXT,
  icon BLOB
);
