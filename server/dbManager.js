/* uses Monk as layer over MongoDB */

// Why use Monk:
// 1. nice syntax (combines similar mongo default functions into more general functions)
// 2. promise-compatible
// 3. has middleware plugins

'use strict';

const dbManager = (logger) => {
  const log = logger;

  // Connection
  const user = process.env.user;
  const password = process.env.password;
  const dbname = process.env.db_name;
  const url = `mongodb://${user}:${password}@[db hosting address]/${dbname}`;

  const db = {};
  let col = {};
  /* sample db workflow */

// TODO: split up into separate funcs for insert, find, update

  require('monk')(url).then((db) => {
    log(`Connected to mongodb at ${url}`);
    // collection
    col = db.get('khan-info');
  }).then((col) => {
    col.remove({});
    return col;
  }).then((col) => {
    log('Collection cleared.');
    const arr = [];
    return col.insert(arr);
  }).then((col) => {
    log(`Inserted ${col.length} docs into collection.`);
  }).then(() => {
    db.close();
    log('db closed successfully.');
  });
};

module.exports = dbManager;
