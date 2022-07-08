const Promise = require('bluebird');
const api = require('../api');
const { ADDR_PREFIX } = require('../config');

module.exports.createSession = (req, res, next) => {
  // console.log('res cookie', res.cookie);
  if (req.cookies['budgeteerid']) {
    api.get.session({hash: req.cookies['budgeteerid']})
      .then((session) => {
        if (session) {
          // console.log('session:', session.user);
          if (session.user) {
            req.session = {
              userId: session.userId,
              user: session.user,
              id: session.id
            }
          } else {
            req.session = {
              id: session.id,
              hash: session.hash
            };
          }
          // console.log('AUTH req session', req.session);
          next();
        } else {
          api.post.session()
            .then((data) => {
              return api.get.session({ id: data.insertId });
            })
            .then((session) => {
              // console.log('session:', session)
              res.cookie('budgeteerid', session.hash);
              req.session = {
                id: session.id,
                hash: session.hash
              };
              next();
            })
            .catch((err) => {
              console.log(err)
              next();
            });
        }
      })
      .catch((err) => {
        console.log(err)
        next();
      });
  } else {
    api.post.session()
    .then((data) => {
      return api.get.session({ id: data.insertId });
    })
    .then((session) => {
      // console.log('session:', session)
      res.cookie('budgeteerid', session.hash);
      req.session = {
        id: session.id,
        hash: session.hash
      };
      // console.log('req session ----->', req.session);
      next();
    })
    .catch((err) => {
      console.log(err)
      next();
    });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.verifySession = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.sendStatus(401)
  }
}
