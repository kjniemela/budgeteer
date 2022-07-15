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
  async envelopes(userId, options) {
    try {
      const parsedOptions = parseData(options);
      const envelopeDataMap = {};
      let envelopesQueryString = `
        SELECT envelopes.*
        FROM envelopes
        INNER JOIN userenvelopepermissions as perms ON perms.envelopeId = envelopes.id
        WHERE perms.permissionLvl >= 1 AND perms.userId = ${userId}
        ${options ? ` AND ${parsedOptions.string.join(' AND ')}` : ''};
      `;
      const envelopes = await executeQuery(envelopesQueryString, parsedOptions.values);
      let expensesQueryString = `
        SELECT expenses.envelopeId, SUM(expenses.amount) as net_expenses, MAX(expenses.posted_on) as last_used
        FROM expenses
        INNER JOIN userenvelopepermissions as perms ON perms.envelopeId = expenses.envelopeId
        WHERE perms.permissionLvl >= 1 AND perms.userId = ${userId}
        ${options ? ` AND ${parsedOptions.string.join(' AND ')}` : ''}
        GROUP BY expenses.envelopeId;
      `;
      const envelopeExpenses = await executeQuery(expensesQueryString, parsedOptions.values);
      let depositsQueryString = `
        SELECT eds.envelopeId, SUM(eds.amount) as net_deposits, MAX(eds.posted_on) as last_deposit
        FROM envelopedeposits as eds
        INNER JOIN userenvelopepermissions as perms ON perms.envelopeId = eds.envelopeId
        WHERE perms.permissionLvl >= 1 AND perms.userId = ${userId}
        ${options ? ` AND ${parsedOptions.string.join(' AND ')}` : ''}
        GROUP BY eds.envelopeId;
      `;
      const envelopeDeposits = await executeQuery(depositsQueryString, parsedOptions.values);
      envelopeExpenses.map((entry) => envelopeDataMap[entry.envelopeId] = {
        ...envelopeDataMap[entry.envelopeId], 
        net_expenses: Number(entry.net_expenses),
        last_used: entry.last_used,
      });
      envelopeDeposits.map((entry) => envelopeDataMap[entry.envelopeId] = {
        ...envelopeDataMap[entry.envelopeId],
        net_deposits: Number(entry.net_deposits),
        last_deposit: entry.last_deposit,
        balance: Math.round((entry.net_deposits - (envelopeDataMap[entry.envelopeId]?.net_expenses || 0)) * 100) / 100,
      });

      return [null, envelopes.map((envelope) => ({...envelope, ...envelopeDataMap[envelope.id]}))];
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
  async budgetNames(userId, options) {
    try {
      const parsedOptions = parseData(options);
      let queryString = `
        SELECT budgets.*
        FROM budgets
        INNER JOIN userbudgetpermissions as perms ON perms.budgetId = budgets.id
        WHERE perms.permissionLvl >= 1 AND perms.userId = ${userId}
        ${options ? ` AND ${parsedOptions.string.join(' AND ')}` : ''};
      `;
      const envelopes = await executeQuery(queryString, parsedOptions.values);
      return [null, envelopes];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} userId the id of the current user
   * @param {number} budgetid the id of the budget to fetch
   * @param {string} start far end of time range (inclusive)
   * @param {string} end near end of time range (inclusive)
   * @returns 
   */
  async budgetById(userId, budgetId, start, end) {
    try {
      const queryString1 = `
        SELECT *
        FROM budgets
        WHERE
          budgets.id = ${budgetId}
        LIMIT 1;
      `;
      const queryString2 = `
        SELECT bcols.*, JSON_OBJECTAGG(brows.start_time, brows.amount) as 'rows'
        FROM budgetcols as bcols
        INNER JOIN budgetrows as brows
          ON brows.budget_col_id = bcols.id
        INNER JOIN userbudgetpermissions as perms
          ON perms.budgetId = bcols.budget_id
        WHERE
          bcols.budget_id = ${budgetId}
          AND perms.userId = ${userId}
          AND perms.permissionLvl >= 1
          AND brows.start_time >= '${start}-01'
          AND brows.start_time <= '${end}-01'
        GROUP BY brows.budget_col_id;
      `;
      const budget = (await executeQuery(queryString1))[0];
      const columns = await executeQuery(queryString2);
      if (!budget) return [404, null];
      return [null, { budget, columns }];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} userId the id of the current user
   * @param {number} budgetid the id of the budget to fetch
   * @param {number} year 
   * @param {number} month 
   * @returns 
   */
  async budgetRowById(userId, budgetId, year, month) {
    try {
      const queryString = `
        SELECT 
          SUM(expenses.amount) as amount,
          expenses.budget_col_id as col
        FROM expenses
        INNER JOIN userbudgetpermissions as perms
          ON perms.budgetId = expenses.budgetId
        WHERE
          perms.permissionLvl >= 1
          AND perms.userId = ${userId}
          AND expenses.posted_on >= "${year}-${month}-01"
          AND expenses.posted_on < "${month === 12 ? year + 1 : year}-${(month % 12) + 1}-01"
          AND expenses.budgetId = ${budgetId}
        GROUP BY expenses.budget_col_id;
      `;
      const rowSums = await executeQuery(queryString);
      // if (!budget) return [404, null];
      return [null, { rowSums }];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} userId the id of the current user
   * @param {number} budgetid the id of the budget to fetch
   * @param {*} options
   * @returns 
   */
  async columnsByBudgetId(userId, budgetId, options) {
    try {
      const parsedOptions = parseData(options);
      let queryString = `
        SELECT budgetcols.id, budgetcols.title
        FROM budgetcols
        INNER JOIN userbudgetpermissions as perms ON perms.budgetId = budgetcols.budget_id
        WHERE 
          perms.permissionLvl >= 1
          AND perms.userId = ${userId}
          AND budgetcols.budget_id = ${budgetId}
          ${options ? `AND ${parsedOptions.string.join(' AND ')}` : ''};
      `;
      const columns = await executeQuery(queryString, parsedOptions.values);
      return [null, columns];
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
  async envelopeNames(userId, options) {
    try {
      const parsedOptions = parseData(options);
      let queryString = `
        SELECT envelopes.*
        FROM envelopes
        INNER JOIN userenvelopepermissions as perms ON perms.envelopeId = envelopes.id
        WHERE perms.permissionLvl >= 1 AND perms.userId = ${userId}
        ${options ? ` AND ${parsedOptions.string.join(' AND ')}` : ''};
      `;
      const envelopes = await executeQuery(queryString, parsedOptions.values);
      return [null, envelopes];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} userId the id of the current user
   * @returns 
   */
  async balanceByUser(userId) {
    try {
      let queryString = `
        SELECT SUM(amount) as amount
        FROM expenses
        WHERE posted_by = ${userId}
        UNION
        SELECT SUM(amount) as amount
        FROM income
        WHERE posted_to = ${userId};
      `;
      const data = await executeQuery(queryString);
      const expenses = Number(data[0] && data[0].amount);
      const earnings = Number(data[1] && data[1].amount);
      const balance = earnings - expenses;
      return [null, {
        expenses,
        earnings,
        balance,
      }];
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
          CONCAT(users.firstname, " ", users.lastname) as posted_by,
          budgetcols.title as 'column'
        FROM expenses
        INNER JOIN users ON users.id = expenses.posted_by
        LEFT JOIN budgetcols ON expenses.budget_col_id = budgetcols.id
        WHERE expenses.posted_by = ${userId}
        ${options ? ` AND ${parsedOptions.string.join(' AND ')}` : ''};
      `;
      const expenses = await executeQuery(queryString, parsedOptions.values);
      return [null, expenses];
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
  async income(userId, options) {
    try {
      const parsedOptions = parseData(options);
      let queryString = `
        SELECT
        income.*,
          CONCAT(users.firstname, " ", users.lastname) as posted_to
        FROM income
        INNER JOIN users ON users.id = income.posted_to
        WHERE income.posted_to = ${userId}
        ${options ? ` AND ${parsedOptions.string.join(' AND ')}` : ''};
      `;
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
  async envelopes(userId, { title }) {
  
    const newEntry = {
      title,
    };
    const queryString1 = `INSERT INTO envelopes SET ?`;
    const insertData = await executeQuery(queryString1, newEntry);

    const newPermEntry = {
      userId,
      envelopeId: insertData.insertId,
      permissionLvl: 5,
    };
  
    const queryString2 = `INSERT INTO userenvelopepermissions SET ?`;
    return [null, [insertData, executeQuery(queryString2, newPermEntry)]];
  }

  /**
   * 
   * @param {number} userId the id of the current user
   * @param {*} entryData
   * @returns 
   */
  deposits(userId, { amount, envelope }) {
  
    const newEntry = {
      amount,
      envelopeId: envelope,
      posted_on: new Date(),
      posted_by: userId,
    };
  
    const queryString = `INSERT INTO envelopedeposits SET ?`;
    return [null, executeQuery(queryString, newEntry)];
  }

  /**
   * 
   * @param {number} userId the id of the current user
   * @param {*} entryData
   * @returns 
   */
  expenses(userId, { amount, vendor, memo, date, envelope, budget, column }) {
  
    const newEntry = {
      amount,
      vendor,
      memo,
      envelopeId: envelope || null,
      budgetId: budget || null,
      budget_col_id: budget ? column : null,
      posted_on: new Date(date),
      posted_by: userId,
    };
  
    const queryString = `INSERT INTO expenses SET ?`;
    return [null, executeQuery(queryString, newEntry)];
  }

  /**
   * 
   * @param {number} userId the id of the current user
   * @param {*} entryData
   * @returns 
   */
  income(userId, { amount, source, memo, date }) {
  
    const newEntry = {
      amount,
      source,
      memo,
      posted_on: new Date(date),
      posted_to: userId,
    };
  
    const queryString = `INSERT INTO income SET ?`;
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