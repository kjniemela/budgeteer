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

app.get(`${ADDR_PREFIX}/verify`, Auth.verifySession, (req, res) => {
  res.status(200);
  res.json(req.session.user);
});

app.get(`${ADDR_PREFIX}/api/expenses`, Auth.verifySession, async (req, res) => {
  const [err, data] = await api.get.expenses(req.session.user.id);
  if (err) return res.sendStatus(err);
  return res.json(data);
});

app.post(`${ADDR_PREFIX}/api/expenses`, Auth.verifySession, async (req, res) => {
  const [err, data] = await api.post.expenses(req.session.user.id, req.body);
  if (err) return res.sendStatus(err);
  return res.sendStatus(201);
});

app.post(`${ADDR_PREFIX}/logout`, async (req, res) => {
  try {
    await api.delete.session({ id: req.session.id })
    res.clearCookie('budgeteerid', req.session.id);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post(`${ADDR_PREFIX}/login`, async (req, res) => {
  try {  
    const [errCode, user] = await api.get.user({ email: req.body.email }, true);
    if (user) {
      req.loginId = user.id;
      const isValidUser = api.validatePassword(req.body.password, user.password, user.salt);
      if (isValidUser) {
        await api.put.session({ id: req.session.id }, { userId: req.loginId });
        res.sendStatus(200);
      } else {
        return res.sendStatus(401)
      }
    }
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

app.post(`${ADDR_PREFIX}/signup`, async (req, res) => {
  try {
    const data = await api.post.user( req.body );
    try {
      await api.put.session({ id: req.session.id }, { userId: data.insertId });
      res.status(201);
      return res.redirect(`${ADDR_PREFIX}/`);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400);
      return res.end('email taken')
    }
    return res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});