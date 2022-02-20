CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  email TEXT,
  self_description TEXT,
  icon BLOB
);
