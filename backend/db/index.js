const mysql = require('mysql2');
const dbConfig = require('./config');
const Promise = require('bluebird');

const connection = mysql.createConnection({
  ...dbConfig,
  multipleStatements: true,
});

const db = Promise.promisifyAll(connection, { multiArgs: true });

db.connectAsync()
  .then(() =>
    console.log(`Connected to ${dbConfig.database} database as ID ${db.threadId}`)
  )

module.exports = db;