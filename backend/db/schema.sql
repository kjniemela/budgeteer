USE budgeteer;

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  firstname VARCHAR(32),
  lastname VARCHAR(32),
  PRIMARY KEY (id)
);

CREATE TABLE income (
  id INT NOT NULL AUTO_INCREMENT,
  amount INT,
  source VARCHAR(32),
  memo VARCHAR(128),
  posted_on DATETIME,
  posted_to INT,
  docref INT,
  FOREIGN KEY (posted_to) REFERENCES users (id)
);

CREATE TABLE expenses (
  id INT NOT NULL AUTO_INCREMENT,
  amount INT,
  vendor VARCHAR(32),
  memo VARCHAR(128),
  posted_on DATETIME,
  posted_by INT,
  docref INT,
  FOREIGN KEY (posted_by) REFERENCES users (id)
);