'use strict';

/* Collects data from Khan Academy and Youtube APIs.
   Intended to be run once, with data being stored persistently
   (Is the only part of the app that deals with IO, data storage)
*/

// custom logger --> share one instance across all modules/files
const log = require('./logger.js');
const Promise = require('bluebird');

// TODO: use MongoDB instead of storing as JSON file manually

const YD = require('./youtubedata.js')(log);

// promisify IO functions, replacing callbacks
const writeFile = Promise.promisify(require('fs').writeFile);
const readFile = Promise.promisify(require('fs').readFile);
const stat = Promise.promisify(require('fs').stat);

const topicsFilePath = './data/topics.json';

const kaTopicTree = require('./ka-topic-tree.js')(log, false);

/* basic caching */
// fs.stat returns result if file exists, ENOENT error if file doesn't exist
const getTopics = rootTopic =>
  stat(topicsFilePath)
  .then(result =>
    // if file exists, read from file
    readFile(topicsFilePath)
    .then((contents) => {
      log.info('Loaded topics from file.');
      return JSON.parse(contents);
    }))
  .catch(err =>
    // if file doesn't exist, get from API
    kaTopicTree.getFromAPI(rootTopic)
    .then((results) => {
      writeFile(topicsFilePath, JSON.stringify(results)); // write to file
      log.info('Written topics to file.');
      return results;
    }),
  );

// wrapper: get youtube video ID from Khan Academy API
const addYoutubeID = (obj) => {
  // check topic is valid string
  if (!obj || !obj.title) {
    return Promise.reject('Improper topic');
  }
  // shortcut if already have youtube id
  if (obj.youtubeid) {
    return Promise.resolve(obj);
  }

  return YD.getYoutubeID(obj.title)
    .then((yid) => {
      obj.youtubeid = yid;
      return obj;
    });
};
// wrapper: add video info from Youtube API
const addVideoInfo = (obj) => {
  // check youtube video id valid
  const yid = obj.youtubeid;
  if (!yid || typeof yid !== 'string') {
    return Promise.reject('Youtube ID does not exist.');
  }
  // shortcut if already have video info
  if (obj.videoInfo) {
    return Promise.resolve(obj);
  }

  return YD.getVideoInfo(yid)
    .then((info) => {
      obj.videoInfo = info;
      return obj;
    });
};

// TODO: eventually convert to streams to reduce memory usage

// 1. get topics
const execute = (rootTopic) =>
  getTopics(rootTopic)
  .tap(topics => log.info(`${topics.length} topics.`))
  .map(addYoutubeID, // 2. get Youtube video ID of each video if needed (is slowest step)
    {
      concurrency: 20, // 20 max concurrent to prevent ECONNRESET and ETIMEDOUT
    })
  .tap(obj => log.info('Youtube IDs acquired.'))
  .then((results) => {
    writeFile(topicsFilePath, JSON.stringify(results)); // write to file
    log.info('Written Youtube IDs to file.');
    return results;
  })
  .map(addVideoInfo, // 3. get Youtube video info of each video if needed
    {
      concurrency: 20, // 20 max concurrent to prevent ECONNRESET and ETIMEDOUT
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
// start with a root (proof of concept)
execute('cells');

// global-art-architecture: 19 videos
// cells: 61 videos
// humanities: 2465 videos