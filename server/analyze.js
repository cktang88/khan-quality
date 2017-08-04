/* analyze data */
const log = require('./logger.js');
const Promise = require('bluebird');
const db = require('./dbManager.js')(log);

// maybe try mapreduce? https://docs.mongodb.com/manual/reference/command/mapReduce/#dbcmd.mapReduce

db.connect()
  .then(() => {
    let query = {
      $where: function(){ // $where is not available for node.js mongo...
        log.info(this.videoInfo.statistics.viewCount);
        return false;
        return Number(this.videoInfo.statistics.viewCount) > 1000000;
      }
    };
    // look into sorting - http://mongodb.github.io/node-mongodb-native/markdown-docs/queries.html#sorting
    let arr = db.find(query);
    log.info(arr);

    arr.each((err, doc) => {
      if (doc)
        log.info(doc.title);
      else
        log.info(doc);
    });

    log.info('hello');
    return arr;
  })
  .then(db.close) // if omitted, process never ends. If done, then exits with null error.
  .catch(err => log.error(err));