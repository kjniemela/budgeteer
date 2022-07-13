const db = require('../db');
const fsPromises = require('fs').promises;
const path = require('path');

/**
 * Export contents of database to JSON for ETL purposes.
 */
async function dbExport() {
  const tables = (await db.queryAsync('SHOW TABLES;'))[0].map(item => item['Tables_in_budgeteer']);
  
  for(const table of tables) {
    const types = {};
    const typeArray = (await db.queryAsync(`DESCRIBE ${table};`))[0].map(item => types[item.Field] = item.Type);
    console.log(types)

    const itemArray = await db.queryAsync(`SELECT * FROM ${table};`);
    const items = {};
    itemArray[0].forEach((item, i) => {
      items[i] = item;
    });
    await fsPromises.writeFile(path.join(__dirname, `export/${table}.json`), JSON.stringify({
      types,
      items,
    }));
  }
};

async function main() {
  await dbExport();
  db.end();
}

if (require.main === module) {
  main();
}

module.exports = dbExport;