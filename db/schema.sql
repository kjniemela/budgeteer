USE budgeteer;

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  firstname VARCHAR(32),
  lastname VARCHAR(32),
  PRIMARY KEY (id)
);

CREATE TABLE transactions (
  amount INT,
  vendor VARCHAR(32),
  memo VARCHAR(128),
  posted_on DATETIME,
  posted_by INT,
  FOREIGN KEY (posted_by) REFERENCES users (id)
);