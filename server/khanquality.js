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

  const options = {
    json: true, // Automatically parses the JSON string in the response
  };

  const kaTopicTree = require('./ka-topic-tree.js')(log, false);

  /* basic caching */
  // fs.stat returns result if file exists, ENOENT error if file doesn't exist
  const getTopics = (rootTopic) => stat(topicsFilePath)
    // if file exists, read from file
    .then(result => readFile(topicsFilePath).then((contents) => {
      log.info('Loaded topics from file.');
      return JSON.parse(contents);
    }))
    .catch(err =>
      // if file doesn't exist (assume not corrupted), then get from API
      kaTopicTree.getFromAPI(rootTopic)
      // convert each topic to an obj
      .map(topicTitle => ({
        title: topicTitle
      }))
      .then((results) => {
        // aggregated results, in the form of jagged(nested) array
        // log.info(results);
        writeFile(topicsFilePath, JSON.stringify(results)); // write to file
        log.info('Written topics to file.');
        return results;
      }),
    );

  // get corresponding Youtube video ID of a topic - Khan Academy API
  const getYoutubeID = (obj) => {
    // check topic is valid string
    if (obj === null || obj === undefined) {
      return Promise.reject('Improper topic');
    }
    // shortcut if already have youtube id
    if (obj.youtubeid)
      return Promise.resolve(obj.youtubeid);

    const title = obj.title;
    options.uri = `http://www.khanacademy.org/api/v1/videos/${title}`;
    return rp(options)
      .then(rawdata => rawdata.translated_youtube_id)
      .catch((err) => {
        log.error(err);
      });
  };

  // get Youtube video detailed info from Youtube API
  const getVideoInfo = (obj) => {
    // shortcut if already have video info
    if (obj.videoInfo)
      return Promise.resolve(obj.videoInfo);

    // check youtube video id valid
    const yid = obj.youtubeid;
    if (yid === null || yid === undefined || typeof yid !== 'string') {
      return Promise.reject('Youtube ID does not exist.');
    }

    const baseurl = 'https://www.googleapis.com/youtube/v3/videos';
    const key = process.env.kq_youtube_key;
    // note: can't access 'fileDetails' param unless owner of video
    const reqparts = ['snippet', 'contentDetails', 'statistics'].join('%2C');
    const fullurl = `${baseurl}?id=${yid}` + `&part=${reqparts}` + `&key=${key}`;
    options.uri = fullurl;
    return rp(options)
      .then((rawdata) => {
        // log.info(obj);
        if (!rawdata || rawdata.length == '')
          return Promise.reject('Could not get data from url.');

        // remove unnecessary data to reduce file size & process memory usage
        // approx. 75% reduction (tested: 280kb -> 67kb)
        if (!rawdata.items[0]) {
          log.info('undefined snippet');
          return rawdata;
        }
        const snip = rawdata.items[0].snippet;
        snip.description = "omitted";
        snip.thumbnails = "omitted";
        snip.localized.description = "omitted";
        return rawdata;
      })
      .catch((err) => {
        log.error(err);
      });
  };

  // main runner
  // 1. get topics
  const execute = (rootTopic) => {
    getTopics(rootTopic).tap((topics) => {
      log.info(`${topics.length} topics.`);
    }).map(obj =>
      // 2. get Youtube video ID of each video if needed (is slowest step)
      getYoutubeID(obj).then(yid => {
        obj.youtubeid = yid;
        return obj;
      })
      // 20 concurrent max to prevent ECONNRESET and ETIMEDOUT
      , {
        concurrency: 20
      }
    ).tap(obj => log.info('Youtube IDs acquired.')).then((results) => {
      writeFile(topicsFilePath, JSON.stringify(results)); // write to file
      log.info('Written Youtube IDs to file.');
      return results;
    }).map(obj =>
      // 3. get Youtube video info of each video if needed
      getVideoInfo(obj).then(info => {
        obj.videoInfo = info;
        return obj;
      }),
      // 20 concurrent max to prevent ECONNRESET and ETIMEDOUT 
      {
        concurrency: 20
      }
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