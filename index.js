const express = require('express');
const db = require('./db');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/transactions', async (req, res) => {
  data = await db.queryAsync('SELECT transactions.*, CONCAT(users.firstname, " ", users.lastname) as posted_by FROM transactions INNER JOIN users ON users.id = transactions.posted_by;');
  res.json(data[0]);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});