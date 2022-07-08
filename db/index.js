const mysql = require("mysql2");
const Promise = require("bluebird");
const database = "budgeteer";

const connection = mysql.createConnection({
  user: "root",
  password: "",
  database
});

const db = Promise.promisifyAll(connection, { multiArgs: true });

db.connectAsync()
  .then(() =>
    console.log(`Connected to ${database} database as ID ${db.threadId}`)
  )

module.exports = db;