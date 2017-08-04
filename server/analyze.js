/* analyze data */
const log = require('./logger.js');
const Promise = require('bluebird');
const db = require('./dbManager.js')(log);

db.connect()
  .then(() => {
    log.info('hello');
  })
  .then(db.close) // if omitted, process never ends. If done, then exits with null error.
  .catch(err => log.error(err));