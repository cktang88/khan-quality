/* uses Monk as layer over MongoDB */

// Why use Monk:
// 1. nice syntax (combines similar mongo default functions into more general functions)
// 2. promise-compatible
// 3. has middleware plugins

'use strict';

// Connection
const user = process.env.user;
const password = process.env.password;
const dbname = process.env.db_name;
const url = `mongodb://${user}:${password}@[db hosting address]/${dbname}`;

// shortcut
const log = console.log;

let db = {};
/* sample db workflow */
require('monk')(url).then((adb) => {
  try {
    // drop db by connecting to underlying db instance
    adb._db.dropDatabase();
    console.log('DB dropped.');
    db = adb;
  } catch (e) {
    log(e);
  }
}).then(() => {
  log(`Connected to mongodb at ${url}`);
  // collection
  return db.get('bios-sample-data');
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
