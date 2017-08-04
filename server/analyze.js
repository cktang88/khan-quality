/* analyze data */
const log = require('./logger.js');
const Promise = require('bluebird');
const db = require('./dbManager.js')(log);

// maybe try mapreduce? https://docs.mongodb.com/manual/reference/command/mapReduce/#dbcmd.mapReduce

db.connect()
  .then(() => {
    const query = {
      'videoInfo.statistics.viewCount': {
        $gt: 5000000,
      },
    };

    // look into sorting - http://mongodb.github.io/node-mongodb-native/markdown-docs/queries.html#sorting
    const arr = db.find(query);
    log.info(arr);

    arr.each((err, doc) => {
      if (doc) { log.info(doc.title); } else { log.info(doc); }
    });

    log.info('hello');
    return arr;
  })
  .then(db.close) // if omitted, process never ends. If done, then exits with null error.
  .catch(err => log.error(err));
