DROP DATABASE IF EXISTS budgeteer;
CREATE DATABASE budgeteer;
USE budgeteer;

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  firstname VARCHAR(32),
  lastname VARCHAR(32),
  email VARCHAR(64) UNIQUE,
  password VARCHAR(64),
  salt VARCHAR(64),
  PRIMARY KEY (id)
);

CREATE TABLE sessions (
  id INT NOT NULL AUTO_INCREMENT,
  hash VARCHAR(64),
  userId INT,
  FOREIGN KEY (userId) REFERENCES users (id),
  PRIMARY KEY (id)
);

CREATE TABLE budgets (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(64),
  PRIMARY KEY (id)
);

CREATE TABLE userbudgetpermissions (
  userId INT,
  budgetId INT,
  permissionLvl TINYINT, /* 0 - no permission, 1 - read, 2 - read/suggest, 3 - read/write, 4 - read/write/delete, 5 - full admin */
  FOREIGN KEY (userId) REFERENCES users (id),
  FOREIGN KEY (budgetId) REFERENCES budgets (id)
);

CREATE TABLE budgetinserts (
  id INT NOT NULL AUTO_INCREMENT,
  amount DECIMAL(8,2),
  posted_on DATETIME,
  posted_by INT,
  budgetId INT,
  FOREIGN KEY (posted_by) REFERENCES users (id),
  FOREIGN KEY (budgetId) REFERENCES budgets (id),
  PRIMARY KEY (id)
);

CREATE TABLE income (
  id INT NOT NULL AUTO_INCREMENT,
  amount DECIMAL(8,2),
  source VARCHAR(32),
  memo VARCHAR(128),
  posted_on DATETIME,
  posted_to INT,
  docref INT,
  FOREIGN KEY (posted_to) REFERENCES users (id),
  PRIMARY KEY (id)
);

CREATE TABLE expenses (
  id INT NOT NULL AUTO_INCREMENT,
  amount DECIMAL(8,2),
  vendor VARCHAR(32),
  memo VARCHAR(128),
  posted_on DATETIME,
  posted_by INT,
  budgetId INT,
  docref INT,
  FOREIGN KEY (posted_by) REFERENCES users (id),
  FOREIGN KEY (budgetId) REFERENCES budgets (id),
  PRIMARY KEY (id)
);