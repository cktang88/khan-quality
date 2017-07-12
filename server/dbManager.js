'use strict';

const dbManager = (logger) => {
  const log = logger;

  // Connection
  const pe = process.env;
  const url = `mongodb://${pe.user}:${pe.password}@${pe.db_host}:${pe.db_port}/${pe.db_name}`;

  let db = {};
  let collection = {};

  const connect = () => require('mongodb').MongoClient.connect(url)
  .then((db_inst) => {
    log.info(`Connected to mongodb at ${url}`);
    // get db, collection
    db = db_inst;
    collection = db.collection('khan-info'); // get existing collection, or create if doesn't exist
  }).catch(err => log.error(err));
  /*
  then((col) => {
    col.remove({});
    return col;
  }).then((col) => {
    log('Collection cleared.');
    });
    */

  /*
  db.close();
  log.info('db closed successfully.');
  */

  const upsert = doc => {
    // Update the document using an UPSERT operation, ensuring creation if it does not exist
    // does not change "_id" value
    return collection.updateOne({title: doc.title}, doc, {upsert: true})
      .then(() => {
        log.debug(`Inserted ${doc.title}`);
      })
      .catch(err => {
        log.error(err);
      });
      // note use {$set: ...} to set just one field
  }
  
  return {
    connect: connect,
    upsert: upsert
  }
};

module.exports = dbManager;