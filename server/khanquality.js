/*

Main application-specific module.

Usage:
const kq = require('./khanquality.js')(loggerInstance);
kq.execute();

*/

'use strict';

const KhanQuality = (logger) => {
  const rp = require('request-promise');
  const assert = require('assert'); // assert funcs don't work w/ promises, which never throw...
  const Promise = require('bluebird');
  const log = logger;

  // TODO: eventually convert to streams to reduce memory usage

  // promisify IO functions, replacing callbacks
  const writeFile = Promise.promisify(require('fs').writeFile);
  const readFile = Promise.promisify(require('fs').readFile);
  const stat = Promise.promisify(require('fs').stat);

  const topicsFilePath = './data/topics.json';
  // the entire topic tree is 30mb :(
  const rootTopic = 'cells'; // start off with a root (proof of concept)

  const options = {
    headers: {
      // spoof user-agent
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
    },
    json: true, // Automatically parses the JSON string in the response
  };

  const kaTopicTree = require('./ka-topic-tree.js')(log, false);

  /* basic caching */
  // fs.stat returns result if file exists, ENOENT error if file doesn't exist
  const getTopics = () => stat(topicsFilePath)
    // if file exists, read from file
    .then(result => readFile(topicsFilePath).then((contents) => {
      log.info('Loaded topics from file.');
      return JSON.parse(contents);
    }))
    .catch(err =>
      // if file doesn't exist (assume not corrupted), then get from API
      kaTopicTree.getFromAPI('cells')
      .then((results) => {
        // aggregated results, in the form of jagged(nested) array
        // log.info(results);
        writeFile(topicsFilePath, JSON.stringify(results)); // write to file
        log.info('Written topics to file.');
        return results;
      }),
    );

  // get corresponding Youtube video ID of a topic - Khan Academy API
  const getYoutubeID = (topic) => {
    // check topic is valid string
    if (topic === null || topic === undefined) {
      return Promise.reject('Improper topic');
    }
    // shortcut if already have youtube id
    if (topic.youtubeid)
      return Promise.resolve(topic.youtubeid);

    if (typeof topic !== 'string') {
      return Promise.reject('Topic is not a string.');
    }

    options.uri = `http://www.khanacademy.org/api/v1/videos/${topic}`;
    return rp(options)
      .then(rawdata => rawdata.translated_youtube_id)
      .catch((err) => {
        log.error(err);
      });
  };

  // get Youtube video detailed info from Youtube API
  const getVideoInfo = (obj) => {
    // check youtube video id valid
    const yid = obj.youtubeid;
    if (yid === null || yid === undefined || typeof yid !== 'string') {
      return Promise.reject('Youtube ID does not exist.');
    }

    const baseurl = 'https://www.googleapis.com/youtube/v3/videos';
    const key = process.env.kq_youtube_key;
    const reqparts = ['snippet', 'contentDetails', 'statistics'].join('%2C');
    const fullurl = `${baseurl}?id=${yid}` + `&part=${reqparts}` + `&key=${key}`;
    options.uri = fullurl;
    return rp(options)
      .then((rawdata) => {
        log.info(rawdata);
        if (!rawdata || rawdata.length == '')
          return Promise.reject('Could not get data from url.');
        return rawdata;
      })
      .catch((err) => {
        log.error(err);
      });
  };

  // main runner
  // 1. get topics
  const execute = () => {
    getTopics().tap((topics) => {
      log.info(`${topics.length} topics.`);
    }).map(topic =>
      // 2. get Youtube video ID of each video if needed
      getYoutubeID(topic).then(yid => ({
        title: topic,
        youtubeid: yid,
      }))
    ).tap(obj => log.info('Youtube IDs acquired.')).map(obj =>
      // 3. get Youtube video info of each video if needed
      getVideoInfo(obj).then(info => ({
        title: obj.title,
        youtubeid: obj.youtubeid,
        videoInfo: info,
      }))
    ).then((results) => {
      writeFile(topicsFilePath, JSON.stringify(results)); // write to file
      log.info('Written Youtube video data to file.');
      log.info('Done.');
    }).catch((err) => {
      log.error(err);
    });
  };

  // then use https://developers.google.com/youtube/v3/docs/videos to get data like upvotes/downvotes/comments/etc.
  // need snippet, contentDetails, statistics
  // date created?, date updated?

  return {
    execute,
  };
};
module.exports = KhanQuality;