const express = require('express');
const db = require('./db');
const api = require('./api');
const CookieParser = require('./middleware/cookieParser');
const Auth = require('./middleware/auth');

const { PORT, ADDR_PREFIX, DEV_MODE } = require('./config');

const app = express();
app.use(express.json());
app.use(CookieParser);
app.use(Auth.createSession);

// Logger if in Dev Mode
if (DEV_MODE) {
  app.use('/', (req, res, next) => {
    console.log(req.method, req.path, req.body || '');
    next();
  })
}

// Server static code and assets
app.use(`${ADDR_PREFIX}/`, express.static('../frontend/dist/'))

app.get(`${ADDR_PREFIX}/test`, Auth.verifySession, (req, res) => {
  res.send('Session Verified!');
});

app.get(`${ADDR_PREFIX}/api/transactions`, async (req, res) => {
  data = await db.queryAsync('SELECT transactions.*, CONCAT(users.firstname, " ", users.lastname) as posted_by FROM transactions INNER JOIN users ON users.id = transactions.posted_by;');
  res.json(data[0]);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});