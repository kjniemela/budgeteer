const db = require('./db');
const utils = require('./lib/hashUtils');
const _ = require('lodash');

const executeQuery = (query, values) => {
  return db.queryAsync(query, values).spread(results => results);
};

const parseData = (options) => {
  return _.reduce(options, (parsed, value, key) => {
    parsed.string.push(`${key} = ?`);
    parsed.values.push(value);
    return parsed;
  }, { string: [], values: [] });
};

class APIGetMethods {
  /**
   * for internal use only - does not conform to the standard return format!
   * @param {{key: value}} options
   * @returns {Promise<session>}
   */
  async session(options) {
    const parsedOptions = parseData(options);
    const queryString = `SELECT * FROM sessions WHERE ${parsedOptions.string.join(' AND ')} LIMIT 1;`;
    const data = await executeQuery(queryString, parsedOptions.values);
    const session = data[0];
    if (!session || !session.userId) return session;
    const [errCode, user] = await api.get.user({ id: session.userId });
    session.user = user;
    return session;
  }

  /**
   * returns a "safe" version of the user object with password data removed unless the includeAuth parameter is true
   * @param {*} options 
   * @param {boolean} includeAuth 
   * @returns {Promise<[errCode, data]>}
   */
  async user(options, includeAuth=false) {
    try {
      if (!options || Object.keys(options).length === 0) throw 'options required for api.get.user';
      const parsedOptions = parseData(options);
      const queryString = `SELECT * FROM users WHERE ${parsedOptions.string.join(' AND ')} LIMIT 1;`;
      const user = (await executeQuery(queryString, parsedOptions.values))[0];
      if (!includeAuth) {
        delete user.password;
        delete user.salt;
      }
      return [null, user];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {*} options
   * @returns 
   */
  async users(options) {
    try {
      const parsedOptions = parseData(options);
      let queryString;
      if (options) queryString = `
        SELECT 
          id, username,
          createdAt, updatedAt
        FROM users 
        WHERE ${parsedOptions.string.join(' AND ')};
      `;
      else queryString = 'SELECT id, username, createdAt, updatedAt FROM users;';
      const users = await executeQuery(queryString, parsedOptions.values);
      return [null, users];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} userId the id of the current user
   * @param {*} options
   * @returns 
   */
  async budgets(userId, options) {
    try {
      const parsedOptions = parseData(options);
      const budgetDataMap = {};
      let budgetsQueryString = `
        SELECT budgets.*
        FROM budgets
        INNER JOIN userbudgetpermissions as perms ON perms.budgetId = budgets.id
        WHERE perms.permissionLvl >= 1 AND perms.userId = ${userId}
        ${options ? ` AND ${parsedOptions.string.join(' AND ')}` : ''};
      `;
      const budgets = await executeQuery(budgetsQueryString, parsedOptions.values);
      let expensesQueryString = `
        SELECT expenses.budgetId, SUM(expenses.amount) as net_expenses, MAX(expenses.posted_on) as last_used
        FROM expenses
        INNER JOIN userbudgetpermissions as perms ON perms.budgetId = expenses.budgetId
        WHERE perms.permissionLvl >= 1 AND perms.userId = ${userId}
        ${options ? ` AND ${parsedOptions.string.join(' AND ')}` : ''}
        GROUP BY expenses.budgetId;
      `;
      const budgetExpenses = await executeQuery(expensesQueryString, parsedOptions.values);
      let depositsQueryString = `
        SELECT bins.budgetId, SUM(bins.amount) as net_deposits, MAX(bins.posted_on) as last_deposit
        FROM budgetinserts as bins
        INNER JOIN userbudgetpermissions as perms ON perms.budgetId = bins.budgetId
        WHERE perms.permissionLvl >= 1 AND perms.userId = ${userId}
        ${options ? ` AND ${parsedOptions.string.join(' AND ')}` : ''}
        GROUP BY bins.budgetId;
      `;
      const budgetDeposits = await executeQuery(depositsQueryString, parsedOptions.values);
      budgetExpenses.map((entry) => budgetDataMap[entry.budgetId] = {
        ...budgetDataMap[entry.budgetId], 
        net_expenses: Number(entry.net_expenses),
        last_used: entry.last_used,
      });
      budgetDeposits.map((entry) => budgetDataMap[entry.budgetId] = {
        ...budgetDataMap[entry.budgetId],
        net_deposits: Number(entry.net_deposits),
        last_deposit: entry.last_deposit,
        balance: Math.round((entry.net_deposits - budgetDataMap[entry.budgetId].net_expenses) * 100) / 100,
      });

      return [null, budgets.map((budget) => ({...budget, ...budgetDataMap[budget.id]}))];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} userId the id of the current user
   * @param {*} options
   * @returns 
   */
  async expenses(userId, options) {
    try {
      const parsedOptions = parseData(options);
      let queryString = `
        SELECT
          expenses.*,
          CONCAT(users.firstname, " ", users.lastname) as posted_by
        FROM expenses
        INNER JOIN
          users ON users.id = expenses.posted_by
        WHERE
          expenses.posted_by = ${userId}
      `;
      if (options) queryString += ` AND ${parsedOptions.string.join(' AND ')}`;
      const expenses = await executeQuery(queryString, parsedOptions.values);
      return [null, expenses];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }
}

class APIPostMethods {
  /**
   * for internal use only - does not conform to the standard return format!
   * @returns 
   */
  session() {
    const data = utils.createRandom32String();
    const hash = utils.createHash(data);
    const queryString = `INSERT INTO sessions SET ?`;
    return executeQuery(queryString, { hash });
  }

  /**
   * 
   * @param {*} userData 
   * @returns 
   */
  user({ firstname, lastname, email, password }) {
    const salt = utils.createRandom32String();

    if (!email) throw new Error('malformed email')
  
    const newUser = {
      firstname,
      lastname,
      email,
      salt,
      password: utils.createHash(password, salt)
    };
  
    const queryString = `INSERT INTO users SET ?`;
    return executeQuery(queryString, newUser);
  }

  /**
   * 
   * @param {number} userId the id of the current user
   * @param {*} entryData
   * @returns 
   */
  async budgets(userId, { title }) {
  
    const newEntry = {
      title,
    };
    const queryString1 = `INSERT INTO budgets SET ?`;
    const insertData = await executeQuery(queryString1, newEntry);

    const newPermEntry = {
      userId,
      budgetId: insertData.insertId,
      permissionLvl: 5,
    };
  
    const queryString2 = `INSERT INTO userbudgetpermissions SET ?`;
    return [null, [insertData, executeQuery(queryString2, newPermEntry)]];
  }

  /**
   * 
   * @param {number} userId the id of the current user
   * @param {*} entryData
   * @returns 
   */
  expenses(userId, { amount, vendor, memo, date }) {
  
    const newEntry = {
      amount,
      vendor,
      memo,
      posted_on: new Date(date),
      posted_by: userId,
    };
  
    const queryString = `INSERT INTO expenses SET ?`;
    return [null, executeQuery(queryString, newEntry)];
  }
}

class APIPutMethods {
  /**
   * for internal use only - does not conform to the standard return format!
   * @param {{key: value}} options 
   * @param {{key: value}} values 
   * @returns 
   */
  session(options, values) {
    const parsedOptions = parseData(options);
    const queryString = `UPDATE sessions SET ? WHERE ${parsedOptions.string.join(' AND ')}`;
    return executeQuery(queryString, Array.prototype.concat(values, parsedOptions.values));
  }
}

class APIDeleteMethods {
  /**
   * for internal use only - does not conform to the standard return format!
   * @param {*} options 
   * @returns 
   */
  session(options) {
    const parsedOptions = parseData(options);
    const queryString = `DELETE FROM sessions WHERE ${parsedOptions.string.join(' AND ')}`;
    return executeQuery(queryString, parsedOptions.values);
  }
}

/**
 * 
 * @param {*} attempted 
 * @param {*} password 
 * @param {*} salt 
 * @returns 
 */
function validatePassword(attempted, password, salt) {
  return utils.compareHash(attempted, password, salt);
};

const api = {
  get: new APIGetMethods(),
  post: new APIPostMethods(),
  put: new APIPutMethods(),
  delete: new APIDeleteMethods(),
  validatePassword: validatePassword,
};

module.exports = api;