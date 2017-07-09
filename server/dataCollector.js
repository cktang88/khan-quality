'use strict';

/* Collects data from Khan Academy and Youtube APIs.
   Intended to be run once, with data being stored persistently
*/

// custom logger --> share one instance across all modules/files
const log = require('./logger.js');
const Promise = require('bluebird');

// TODO: use MongoDB instead of storing as JSON file manually

const kq = require('./khanquality.js')(log);

// promisify IO functions, replacing callbacks
const writeFile = Promise.promisify(require('fs').writeFile);
const readFile = Promise.promisify(require('fs').readFile);
const stat = Promise.promisify(require('fs').stat);

const topicsFilePath = './data/topics.json';

const kaTopicTree = require('./ka-topic-tree.js')(log, false);

/* basic caching */
// fs.stat returns result if file exists, ENOENT error if file doesn't exist
const getTopics = rootTopic => stat(topicsFilePath)
  // if file exists, read from file
  .then(result => readFile(topicsFilePath).then((contents) => {
    log.info('Loaded topics from file.');
    return JSON.parse(contents);
  }))
  .catch(err =>
    // if file doesn't exist (assume not corrupted), then get from API
    kaTopicTree.getFromAPI(rootTopic)
    .then((results) => {
      writeFile(topicsFilePath, JSON.stringify(results)); // write to file
      log.info('Written topics to file.');
      return results;
    }),
  );

// 1. get topics
const execute = rootTopic =>
  getTopics(rootTopic)
  .tap((topics) => {
    log.info(`${topics.length} topics.`);
  })
  .map(obj =>
    // 2. get Youtube video ID of each video if needed (is slowest step)
    kq.getYoutubeID(obj)
    .then((yid) => {
      obj.youtubeid = yid;
      return obj;
    })
    // 20 concurrent max to prevent ECONNRESET and ETIMEDOUT
    , {
      concurrency: 20,
    })
  .tap(obj => log.info('Youtube IDs acquired.'))
  .then((results) => {
    writeFile(topicsFilePath, JSON.stringify(results)); // write to file
    log.info('Written Youtube IDs to file.');
    return results;
  })
  .map(obj =>
    // 3. get Youtube video info of each video if needed
    kq.getVideoInfo(obj)
    .then((info) => {
      obj.videoInfo = info;
      return obj;
    }),
    // 20 concurrent max to prevent ECONNRESET and ETIMEDOUT
    {
      concurrency: 20,
    })
  .then((results) => {
    writeFile(topicsFilePath, JSON.stringify(results)); // write to file
    log.info('Written Youtube video data to file.');
    log.info('Done.');
  })
  .catch((err) => {
    log.error(err);
  });

// the entire topic tree is 30mb :(
// start off with a root (proof of concept)
execute('cells');

// global-art-architecture: 19 videos
// cells: 61 videos
// humanities: 2465 videos
