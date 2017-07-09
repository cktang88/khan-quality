/*
Helper module to retrieve data from APIs

Usage:
const kq = require('./khanquality.js')(loggerInstance);

*/

'use strict';

const KhanQuality = (logger) => {
  const rp = require('request-promise');
  // NTOE: assert funcs don't work w/ promises, which never throw...
  const Promise = require('bluebird');
  const log = logger;

  // TODO: eventually convert to streams to reduce memory usage

  const options = {
    json: true, // Automatically parses the JSON string in the response
  };

  // get corresponding Youtube video ID of a topic - Khan Academy API
  const getYoutubeID = (obj) => {
    // check topic is valid string
    if (!obj) {
      return Promise.reject('Improper topic');
    }
    // shortcut if already have youtube id
    if (obj.youtubeid) {
      return Promise.resolve(obj.youtubeid);
    }

    const title = obj.title;
    options.uri = `http://www.khanacademy.org/api/v1/videos/${title}`;
    return rp(options)
      .then(rawdata => rawdata.translated_youtube_id)
      .catch((err) => {
        log.error(err);
      });
  };

  // get Youtube video detailed info from Youtube API
  // Documentation: https://developers.google.com/youtube/v3/docs/videos
  const getVideoInfo = (obj) => {
    // check youtube video id valid
    const yid = obj.youtubeid;
    if (!yid || typeof yid !== 'string') {
      return Promise.reject('Youtube ID does not exist.');
    }
    // shortcut if already have video info
    if (obj.videoInfo) {
      return Promise.resolve(obj.videoInfo);
    }

    const baseurl = 'https://www.googleapis.com/youtube/v3/videos';
    const key = process.env.kq_youtube_key;
    // note: can't access 'fileDetails' param unless owner of video
    const reqparts = ['snippet', 'contentDetails', 'statistics'].join('%2C');
    const fullurl = `${baseurl}?id=${yid}&part=${reqparts}&key=${key}`;
    options.uri = fullurl;
    return rp(options)
      .then((rawdata) => {
        if (!rawdata || rawdata.length === 0) {
          return Promise.reject('Could not get data from url.');
        }
        /* code specific to extract info from Youtube video listing API */
        const data = rawdata.items[0];
        if (!data) {
          // indicates the video is no longer available for viewing
          log.info(`No video data available for ${obj.title}`);
          return data;
        }
        // remove unnecessary data to reduce file size & process memory usage
        // approx. 80% reduction (tested: 280kb -> 57kb)
        data.etag = 'omit';
        const snip = data.snippet;
        snip.description = 'omit';
        snip.thumbnails = 'omit';
        snip.localized.description = 'omit';
        return data;
      })
      .catch((err) => {
        log.error(err);
      });
  };

  return {
    getYoutubeID,
    getVideoInfo,
  };
};
module.exports = KhanQuality;
