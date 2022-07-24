const db = require('./db');
const md5 = require('md5');
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
    if (!session || !session.user_id) return session;
    const [errCode, user] = await api.get.user({ id: session.user_id });
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
   * @param {number} user_id the id of the current user
   * @param {*} options
   * @returns 
   */
  async contacts(user_id, options) {
    try {
      const parsedOptions = parseData(options);
      const queryString = `
        SELECT
          contacts.*,
          CONCAT(user.firstname, ' ', user.lastname) as user_name,
          CONCAT(contact.firstname, ' ', contact.lastname) as contact_name,
          user.email as user_email,
          contact.email as contact_email
        FROM contacts
        INNER JOIN users as user ON contacts.user_id = user.id
        INNER JOIN users as contact ON contacts.contact_id = contact.id
        WHERE user.id = ${user_id} OR contact.id = ${user_id};
      `;
      const contats = (await executeQuery(queryString, parsedOptions.values)).map(contact => {
        if (contact.user_id === user_id) {
          return {
            ...contact,
            gravatar_link: 'https://www.gravatar.com/avatar/' + md5(contact.contact_email),
          };
        } else {
          return {
            ...contact,
            gravatar_link: 'https://www.gravatar.com/avatar/' + md5(contact.user_email),
          };
        }
      });

      return [null, contats];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {boolean} savings if **true**, only return savings envelopes
   * @param {*} options
   * @returns 
   */
  async envelopes(user_id, savings, options) {
    try {
      const envelopeDataMap = {};
      const parsedOptions = parseData(options);
      const queryString = `
        SELECT 
          ee.*,
          IFNULL(SUM(income.amount), 0) as net_deposits,
          MAX(income.posted_on) as last_deposit,
          IFNULL(SUM(income.amount), 0)-IFNULL(ee.net_expenses, 0) as balance
        FROM income
        RIGHT JOIN (
          SELECT
            envelopes.*, budgets.title as budget,
            IFNULL(SUM(expenses.amount), 0) as net_expenses,
            MAX(expenses.posted_on) as last_used
          FROM envelopes
          LEFT JOIN budgets ON budgets.id = envelopes.budget_id
          LEFT JOIN expenses ON expenses.envelope_id = envelopes.id
          GROUP BY envelopes.id
        ) as ee ON income.envelope_id = ee.id
        INNER JOIN userenvelopepermissions as perms ON perms.envelope_id = ee.id
        WHERE
          perms.permissionLvl >= 1
          AND perms.user_id = ${user_id}
          ${savings ? 'AND ee.is_savings = 1' : ''}
          ${options ? ` AND ${parsedOptions.string.join(' AND ')}` : ''}
        GROUP BY ee.id;
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
   * @param {number} user_id the id of the current user
   * @param {number} envelope_id id of the envelope to fetch
   * @returns 
   */
  async envelopeById(user_id, envelope_id) {
    try {
      const [errCode, envelopes] = await this.envelopes(user_id, false, {
        'ee.id': envelope_id,
      });
      const envelope = envelopes[0];

      const queryString = `
        SELECT 
          perms.user_id, perms.permissionLvl,
          users.email, CONCAT(users.firstname, ' ', users.lastname) as user_name
        FROM userenvelopepermissions as perms
        INNER JOIN users ON perms.user_id = users.id
        WHERE
          perms.permissionLvl >= 1
          AND perms.envelope_id = ${envelope_id};
      `;
      const perms = await executeQuery(queryString);

      if (errCode) return [errCode, null];
      if (!envelope) return [404, null];

      return [null, {
        ...envelope,
        perms,
      }];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {*} options
   * @returns 
   */
  async savings(user_id, options) {
    try {
      const parsedOptions = parseData(options);
      const queryString = `
        SELECT 
          es.savings_id,
          savings.memo,
          JSON_ARRAYAGG(es.envelope_id) as envelopes,
          JSON_OBJECTAGG(es.envelope_id, es.alloc_weight / esa.weight_sum * 100) as alloc_pr,
          JSON_OBJECTAGG(es.envelope_id, es.alloc_weight) as alloc_weight,
          JSON_OBJECTAGG(es.envelope_id, esa.weight_sum) as weight_sum,
          SUM((ei.net_income - IFNULL(ee.net_expenses, 0)) * (es.alloc_weight / esa.weight_sum)) as alloc
        FROM envelopesavings as es
        INNER JOIN (
          SELECT SUM(esw.alloc_weight) as weight_sum, esw.envelope_id FROM envelopesavings as esw GROUP BY esw.envelope_id
        ) as esa ON es.envelope_id = esa.envelope_id
        INNER JOIN (
          SELECT
            envelopes.*,
            SUM(expenses.amount) as net_expenses
          FROM envelopes
          LEFT JOIN expenses ON expenses.envelope_id = envelopes.id
          GROUP BY envelopes.id
        ) as ee ON es.envelope_id = ee.id
        INNER JOIN (
          SELECT
            envelopes.*,
            SUM(income.amount) as net_income
          FROM envelopes
          LEFT JOIN income ON income.envelope_id = envelopes.id
          GROUP BY envelopes.id
        ) as ei ON es.envelope_id = ei.id
        INNER JOIN savings ON es.savings_id = savings.id
        INNER JOIN userenvelopepermissions as perms ON perms.envelope_id = es.envelope_id
        WHERE
          perms.permissionLvl >= 1
          AND perms.user_id = ${user_id}
          ${options ? ` AND ${parsedOptions.string.join(' AND ')}` : ''}
        GROUP BY es.savings_id;
      `;

      const savings = await executeQuery(queryString, parsedOptions.values);

      return [null, savings];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {number} envelope_id the envelope id to filter by
   * @param {*} options
   * @returns 
   */
  async savingsByEnvelopeId(user_id, envelope_id, options) {
    try {
      const [errCode, savings] = await this.savings(user_id, options);

      if (errCode) return [errCode, null];

      return [null, savings.filter(
        row => row.envelopes.includes(envelope_id)
        ).map(
          row => ({
            ...row,
            alloc_pr: row.alloc_pr[envelope_id],
            alloc_weight: row.alloc_weight[envelope_id],
            weight_sum: row.weight_sum[envelope_id],
          })
        )];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {*} options
   * @returns 
   */
  async budgetNames(user_id, options) {
    try {
      const parsedOptions = parseData(options);
      let queryString = `
        SELECT budgets.*
        FROM budgets
        INNER JOIN userbudgetpermissions as perms ON perms.budget_id = budgets.id
        WHERE perms.permissionLvl >= 1 AND perms.user_id = ${user_id}
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
   * @param {number} user_id the id of the current user
   * @param {number} budgetid the id of the budget to fetch
   * @param {string} start far end of time range (inclusive)
   * @param {string} end near end of time range (inclusive)
   * @returns 
   */
  async budgetById(user_id, budget_id, start, end) {
    try {
      const queryString1 = `
        SELECT *
        FROM budgets
        WHERE
          budgets.id = ${budget_id}
        LIMIT 1;
      `;
      const queryString2 = `
        SELECT bcols.*, JSON_OBJECTAGG(brows.start_time, brows.amount) as 'rows'
        FROM budgetcols as bcols
        INNER JOIN budgetrows as brows
          ON brows.budget_col_id = bcols.id
        INNER JOIN userbudgetpermissions as perms
          ON perms.budget_id = bcols.budget_id
        WHERE
          bcols.budget_id = ${budget_id}
          AND perms.user_id = ${user_id}
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
   * @param {number} user_id the id of the current user
   * @param {number} budgetid the id of the budget to fetch
   * @param {number} year 
   * @param {number} month 
   * @returns 
   */
  async budgetRowsById(user_id, budget_id, year, month) {
    try {
      const queryString = `
        SELECT 
          SUM(expenses.amount) as amount,
          expenses.budget_col_id as col
        FROM expenses
        INNER JOIN budgetcols ON expenses.budget_col_id = budgetcols.id
        INNER JOIN userbudgetpermissions as perms
          ON perms.budget_id = budgetcols.budget_id
        INNER JOIN envelopes ON expenses.envelope_id = envelopes.id
        WHERE
          perms.permissionLvl >= 1
          AND perms.user_id = ${user_id}
          AND expenses.posted_on >= "${year}-${month}-01"
          AND expenses.posted_on < "${month === 12 ? year + 1 : year}-${(month % 12) + 1}-01"
          AND budgetcols.budget_id = ${budget_id}
          AND envelopes.budget_id = ${budget_id}
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
   * @param {number} user_id the id of the current user
   * @param {number} budget_id the id of the budget to fetch
   * @param {number} year 
   * @param {number} month 
   * @returns 
   */
   async surplusByBudgetId(user_id, budget_id, year, month) {
    try {
      const incomeQuery = `
        SELECT
          SUM(income.amount) as amount
        FROM income
        INNER JOIN envelopes ON income.envelope_id = envelopes.id
        INNER JOIN userbudgetpermissions as perms
          ON perms.budget_id = envelopes.budget_id
        WHERE
          perms.permissionLvl >= 1
          AND perms.user_id = ${user_id}
          AND envelopes.budget_id = ${budget_id}
      `;

      const expenseQuery = `
        SELECT
          SUM(expenses.amount) as amount
        FROM expenses
        INNER JOIN envelopes ON expenses.envelope_id = envelopes.id
        INNER JOIN userbudgetpermissions as perms
          ON perms.budget_id = envelopes.budget_id
        WHERE
          perms.permissionLvl >= 1
          AND perms.user_id = ${user_id}
          AND envelopes.budget_id = ${budget_id}
      `;

      const queryString1 = `
        ${incomeQuery}
          AND income.posted_on >= "${year}-${month}-01"
          AND income.posted_on < "${month === 12 ? year + 1 : year}-${(month % 12) + 1}-01"
        GROUP BY envelopes.budget_id;
      `;
      const queryString2 = `
        ${expenseQuery}
          AND expenses.posted_on >= "${year}-${month}-01"
          AND expenses.posted_on < "${month === 12 ? year + 1 : year}-${(month % 12) + 1}-01"
        GROUP BY envelopes.budget_id;
      `;
      const queryString3 = `
        ${incomeQuery}
          AND income.posted_on < "${year}-${month}-01"
        GROUP BY envelopes.budget_id;
      `;
      const queryString4 = `
        ${expenseQuery}
          AND expenses.posted_on < "${year}-${month}-01"
        GROUP BY envelopes.budget_id;
      `;
      const queryString5 = `
        ${incomeQuery}
          AND income.posted_on >= "${year}-${month}-01"
          AND income.posted_on < "${month === 12 ? year + 1 : year}-${(month % 12) + 1}-01"
          AND income.source = "TRANSFER"
        GROUP BY envelopes.budget_id;
      `;
      const queryString6 = `
        ${incomeQuery}
          AND income.posted_on < "${year}-${month}-01"
          AND income.source = "TRANSFER"
        GROUP BY envelopes.budget_id;
      `;

      const income = Number((await executeQuery(queryString1))[0]?.amount || 0);
      const expenses = Number((await executeQuery(queryString2))[0]?.amount || 0);
      const pastIncome = Number((await executeQuery(queryString3))[0]?.amount || 0);
      const pastExpenses = Number((await executeQuery(queryString4))[0]?.amount || 0);
      const transfers = Number((await executeQuery(queryString5))[0]?.amount || 0);
      const pastTransfers = Number((await executeQuery(queryString6))[0]?.amount || 0);

      return [null, { 
        income, expenses, pastIncome, pastExpenses, transfers, pastTransfers,
        surplus:  Math.round(((income + pastIncome) - (expenses + pastExpenses)) * 100) / 100
      }];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {number} budgetid the id of the budget to fetch
   * @param {*} options
   * @returns 
   */
  async columnsByBudgetId(user_id, budget_id, options) {
    try {
      const parsedOptions = parseData(options);
      let queryString = `
        SELECT budgetcols.id, budgetcols.title
        FROM budgetcols
        INNER JOIN userbudgetpermissions as perms ON perms.budget_id = budgetcols.budget_id
        WHERE 
          perms.permissionLvl >= 1
          AND perms.user_id = ${user_id}
          AND budgetcols.budget_id = ${budget_id}
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
   * @param {number} user_id the id of the current user
   * @param {*} options
   * @returns 
   */
  async envelopeNames(user_id, options) {
    try {
      const parsedOptions = parseData(options);
      let queryString = `
        SELECT envelopes.*
        FROM envelopes
        INNER JOIN userenvelopepermissions as perms ON perms.envelope_id = envelopes.id
        WHERE perms.permissionLvl >= 1 AND perms.user_id = ${user_id}
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
   * @param {number} user_id the id of the current user
   * @returns 
   */
  async savingsByUserId(user_id) {
    try {
      let queryString = `
        SELECT savings.*
        FROM savings
        INNER JOIN usersavingspermissions as perms ON perms.savings_id = savings.id
        WHERE
          perms.permissionLvl >= 1
          AND perms.user_id = ${user_id};
      `;
      const data = await executeQuery(queryString);
      return [null, data];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @returns 
   */
  async balanceByUserId(user_id) {
    try {
      let queryString = `
        SELECT SUM(amount) as amount
        FROM expenses
        WHERE posted_by = ${user_id}
        UNION
        SELECT SUM(amount) as amount
        FROM income
        WHERE posted_to = ${user_id};
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
   * @param {number} user_id the id of the current user
   * @param {*} options
   * @returns 
   */
  async expenses(user_id, options) {
    try {
      const parsedOptions = parseData(options);
      let queryString = `
        SELECT
          expenses.*,
          CONCAT(users.firstname, " ", users.lastname) as posted_by,
          envelopes.title as envelope,
          budgets.title as budget,
          budgetcols.title as 'column'
        FROM expenses
        INNER JOIN users ON users.id = expenses.posted_by
        INNER JOIN envelopes ON expenses.envelope_id = envelopes.id
        LEFT JOIN budgets ON envelopes.budget_id = budgets.id
        LEFT JOIN budgetcols ON expenses.budget_col_id = budgetcols.id
        INNER JOIN userenvelopepermissions as perms ON expenses.envelope_id = perms.envelope_id
        WHERE
          perms.permissionLvl >= 1
          AND perms.user_id = ${user_id}
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
   * @param {number} user_id the id of the current user
   * @param {*} options
   * @returns 
   */
  async income(user_id, options) {
    try {
      const parsedOptions = parseData(options);
      let queryString = `
        SELECT
          income.*,
          CONCAT(users.firstname, " ", users.lastname) as posted_to,
          envelopes.title as envelope
        FROM income
        INNER JOIN envelopes ON envelopes.id = income.envelope_id
        INNER JOIN users ON users.id = income.posted_to
        INNER JOIN userenvelopepermissions as perms ON income.envelope_id = perms.envelope_id
        WHERE
          perms.permissionLvl >= 1
          AND perms.user_id = ${user_id}
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
   * @param {number} user_id the id of the current user
   * @param {*} entryData
   * @returns 
   */
  async contacts(user_id, { email }) {

    const oldEntry = (await executeQuery(`
      SELECT *
      FROM contacts
      WHERE
        user_id = ${user_id}
        AND contact_id = (SELECT id FROM users WHERE email="${email}");
    `))[0];
    
    if (oldEntry) return [409, null];

    const queryString = `
      INSERT INTO contacts
      VALUES (
        ${user_id},
        (SELECT id FROM users WHERE email="${email}"),
        0
      )
    `;

    try {
      const insertData = await executeQuery(queryString);
  
      return [null, insertData];
    } catch (err) {
      if (err.code === 'ER_BAD_NULL_ERROR') return [400, null];
      else return [500, null];
    }
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {*} entryData
   * @returns 
   */
  async budgets(user_id, { title }) {
  
    const newEntry = {
      title,
    };
    const queryString1 = `INSERT INTO budgets SET ?`;
    const insertData = await executeQuery(queryString1, newEntry);

    const newPermEntry = {
      user_id,
      budget_id: insertData.insertId,
      permissionLvl: 5,
    };
  
    const queryString2 = `INSERT INTO userbudgetpermissions SET ?`;
    return [null, [insertData, executeQuery(queryString2, newPermEntry)]];
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {*} data the rows to be updated or created
   * @returns 
   */
  async budgetRowsById(user_id, data) {

    const perms = (await executeQuery(`
      SELECT *
      FROM userbudgetpermissions
      WHERE
        user_id = ${user_id}
        AND budget_id = ${data.budget.id};
    `))[0];

    if (!perms || perms.permissionLvl < 4) return [403, null];

    for (const column of data.columns) {
      console.log('COL', column.id);

      for (const row in column.rows) {
        const value = Number(column.rows[row]);

        const updateData = await executeQuery(`
          UPDATE budgetrows
          SET amount = ${value}
          WHERE start_time="${row}" AND budget_col_id=${column.id};
        `);

        if (updateData.affectedRows === 0) {
          await executeQuery(`
            INSERT INTO budgetrows
            (amount, start_time, budget_col_id)
            VALUES (${value}, "${row}", ${column.id});
          `);
        }
      }
    }

    return [null, null];
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {*} entryData
   * @returns 
   */
  async columnsByBudgetId(user_id, { title, budgetId, start_time }) {

    // TODO - this code exeists in some other places... factor it out!
    const perms = (await executeQuery(`
      SELECT *
      FROM userbudgetpermissions
      WHERE
        user_id = ${user_id}
        AND budget_id = ${budgetId};
    `))[0];

    if (!perms || perms.permissionLvl < 3) return [403, null];

    const newColEntry = {
      title,
      budget_id: budgetId,
    };
    const queryString1 = `INSERT INTO budgetcols SET ?`;
    const insertData = await executeQuery(queryString1, newColEntry);

    const newRowEntry = {
      amount: null,
      start_time,
      budget_col_id: insertData.insertId,
    };
    const queryString2 = `INSERT INTO budgetrows SET ?`;
    return [null, [insertData, executeQuery(queryString2, newRowEntry)]];
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {*} entryData
   * @returns 
   */
  async envelopes(user_id, { title, budget, savings }) {
  
    const newEntry = {
      title,
      budget_id: budget || null,
      is_savings: !!Number(savings),
    };
    const queryString1 = `INSERT INTO envelopes SET ?`;
    const insertData = await executeQuery(queryString1, newEntry);

    const newPermEntry = {
      user_id,
      envelope_id: insertData.insertId,
      permissionLvl: 5,
    };
  
    const queryString2 = `INSERT INTO userenvelopepermissions SET ?`;
    return [null, [insertData, executeQuery(queryString2, newPermEntry)]];
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {*} entryData
   * @returns 
   */
  async savings(user_id, { memo, target_amount }) {
  
    const newEntry = {
      memo,
      target_amount,
    };
    const queryString1 = `INSERT INTO savings SET ?`;
    const insertData = await executeQuery(queryString1, newEntry);

    const newPermEntry = {
      user_id,
      savings_id: insertData.insertId,
      permissionLvl: 5,
    };
  
    const queryString2 = `INSERT INTO usersavingspermissions SET ?`;
    return [null, [insertData, executeQuery(queryString2, newPermEntry)]];
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {number} savings_id id of savings goal to add to
   * @param {number} envelope_id id of envelope to add
   * @returns 
   */
  async envelopeToSavingsById(user_id, savings_id, envelope_id) {

    const oldEntry = (await executeQuery(`
      SELECT * FROM envelopesavings WHERE savings_id = ${savings_id} AND envelope_id = ${envelope_id};
    `))[0];
    
    if (oldEntry) return [409, null];

    const newEntry = {
      savings_id,
      envelope_id,
      alloc_weight: 0,
    };
    const queryString = `INSERT INTO envelopesavings SET ?`;
    return [null, executeQuery(queryString, newEntry)];
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {*} entryData
   * @returns 
   */
  async expenses(user_id, { amount, vendor, memo, date, envelope, column }) {

    const doc_count = (await executeQuery(`SELECT * FROM doc_counts WHERE user_id = ${user_id};`))[0]?.doc_count || 0;
    if (!doc_count) await executeQuery(`INSERT INTO doc_counts VALUES (${user_id}, 0);`);

    const permissionLvl = (await executeQuery(`
      SELECT * FROM userenvelopepermissions WHERE user_id = ${user_id} AND envelope_id = ${envelope};
    `))[0]?.permissionLvl || 0;
    if (permissionLvl < 3) return [403, null];
  
    const newEntry = {
      amount,
      vendor,
      memo,
      envelope_id: envelope,
      budget_col_id: column || null,
      posted_on: new Date(date),
      posted_by: user_id,
      docref: doc_count + 1,
    };

    await executeQuery(`
      UPDATE doc_counts SET doc_count = ${doc_count + 1} WHERE user_id = ${user_id};
    `);

    const queryString = `INSERT INTO expenses SET ?`;
    return [null, executeQuery(queryString, newEntry)];
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {*} entryData
   * @returns 
   */
  async income(user_id, { amount, source, memo, date, envelope }) {

    const doc_count = (await executeQuery(`SELECT * FROM doc_counts WHERE user_id = ${user_id};`))[0]?.doc_count || 0;
    if (!doc_count) await executeQuery(`INSERT INTO doc_counts VALUES (${user_id}, 0);`);

    const permissionLvl = (await executeQuery(`
      SELECT * FROM userenvelopepermissions WHERE user_id = ${user_id} AND envelope_id = ${envelope};
    `))[0]?.permissionLvl || 0;
    if (permissionLvl < 3) return [403, null];
  
    const newEntry = {
      amount,
      source,
      memo,
      envelope_id: envelope,
      posted_on: new Date(date),
      posted_to: user_id,
      docref: doc_count + 1,
    };

    await executeQuery(`UPDATE doc_counts SET doc_count = ${doc_count + 1} WHERE user_id = ${user_id};`)
  
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

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {*} entryData
   * @returns 
   */
  async contacts(user_id, contact_id) {

    const queryString = `
      UPDATE contacts
      SET accepted = 1
      WHERE 
        user_id = ${contact_id}
        AND contact_id = ${user_id};
    `;

    try {
      const insertData = await executeQuery(queryString);

      if (insertData.affectedRows === 0) return [404, null];
  
      return [null, insertData];
    } catch (err) {
      if (err.code === 'ER_BAD_NULL_ERROR') return [400, null];
      else return [500, null];
    }
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {number} envelope_id the id of envelope to update
   * @param {*} entryData data to update
   * @returns 
   */
  async envelopeById(user_id, envelope_id, entryData) {
    try {
      const queryString1 = `
        UPDATE envelopes SET ? 
        WHERE
          id = ${envelope_id}
          AND ${user_id} IN (
            SELECT perms.user_id FROM userenvelopepermissions as perms WHERE perms.envelope_id = ${envelope_id}
          );
      `;

      return [null, executeQuery(queryString1, entryData)];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {*} entryData data to update
   * @returns 
   */
   async envelopePermissions(user_id, entryData) {
    try {

      const oldEntry = (await executeQuery(`
        SELECT * FROM userenvelopepermissions WHERE user_id = ${entryData.user_id} AND envelope_id = ${entryData.envelope_id};
      `))[0];

      let queryString;
      
      if (oldEntry) {
        queryString = `
          UPDATE userenvelopepermissions SET ? 
          WHERE
            user_id = ${entryData.user_id}
            AND envelope_id = ${entryData.envelope_id};
        `;
      } else {
        queryString = `
          INSERT INTO userenvelopepermissions SET ?;
        `;
      }

      return [null, await executeQuery(queryString, entryData)];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {number} envelope_id the id of envelope to update
   * @param {any[]} savingsGoals data to update
   * @returns 
   */
  async savingsByEnvelopeId(user_id, envelope_id, savingsGoals) {
    try {
      const promises = [];
      for (const goal of savingsGoals) {
        const { savings_id, alloc_weight } = goal;

        const newEntry = {
          savings_id,
          envelope_id,
          alloc_weight,
        };

        const queryString = `
          UPDATE envelopesavings as es SET ? 
          WHERE
            es.envelope_id = ${envelope_id}
            AND es.savings_id = ${savings_id}
            AND ${user_id} IN (
              SELECT perms.user_id FROM userenvelopepermissions as perms WHERE perms.envelope_id = ${envelope_id}
            );
        `;

        console.log(newEntry);

        promises.push(executeQuery(queryString, newEntry));
      }
      await Promise.all(promises);
      console.log(promises)
      return [201, promises];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
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

  /**
   * WARNING: THIS METHOD IS *UNSAFE* AND SHOULD *ONLY* BE CALLED BY AUTHORIZED ROUTES!
   * @param {number} user_id id of user to delete 
   * @returns {Promise<[errCode, data]>}
   */
  async user(user_id) {
    try {
      const sessionQueryString = `DELETE FROM sessions WHERE user_id = ${user_id};`;
      const userQueryString = `DELETE FROM users WHERE id = ${user_id};`;
      await executeQuery(sessionQueryString);
      await executeQuery(userQueryString);
      return [null, null];
    } catch (err) {
      console.error(err);
      return [500, null];
    }
  }

  /**
   * 
   * @param {number} user_id the id of the current user
   * @param {*} entryData
   * @returns 
   */
  async contacts(user_id, contact_id) {

    const queryString = `
      DELETE FROM contacts
      WHERE 
        user_id = ${contact_id}
        AND contact_id = ${user_id};
    `;

    try {
      const deleteData = await executeQuery(queryString);
  
      return [null, deleteData];
    } catch (err) {
      if (err.code === 'ER_BAD_NULL_ERROR') return [400, null];
      else return [500, null];
    }
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