'use strict';

const dbManager = (logger) => {
  const log = logger;

  // Connection
  const pe = process.env;
  const url = `mongodb://${pe.user}:${pe.password}@${pe.db_host}:${pe.db_port}/${pe.db_name}`;

  let db = null;
  let collection = null;

  const connect = () =>
    require('mongodb').MongoClient.connect(url, {
      poolSize: 20,
    }) // default poolsize = 5
    .then((dbInst) => {
      log.info(`Connected to mongodb at ${url}`);
      // get db, collection
      db = dbInst;
      // get existing collection, or create if doesn't exist
      // NOTE: Collections are not created until the first document is inserted
      collection = db.collection('khan-info');
    }).catch(err => log.error(err));

  const upsert = doc =>
    // Update the document using an UPSERT operation, ensuring creation if it does not exist
    // does not change "_id" value
     collection.updateOne({
       title: doc.title,
       youtubeid: doc.youtubeid,
     }, doc, {
       upsert: true,
     })
      .then(res =>
        // if(res.matchedCount!==1 || res.modifiedCount!==1)
        // return Promise.reject(`${res.matchedCount} matched, ${res.modifiedCount} modified`);
        log.debug(`Inserted ${doc.title}`),
      );
    // note use {$set: ...} to set just one field


  // be sure to close
  // https://docs.mongodb.com/manual/reference/method/db.collection.stats/#accuracy-after-unexpected-shutdown
  // can run validate() to verify correct stats
  const close = () => db.close()
    .then((result) => {
      log.info(`DB closed successfully. ${result}`);
    });

  return {
    close,
    connect,
    upsert,
  };
};

module.exports = dbManager;
