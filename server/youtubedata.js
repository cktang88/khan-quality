/*
Retrieve Youtube video-related data from APIs

Usage:
const kq = require('./khanquality.js')(loggerInstance);

*/

'use strict';

const rp = require('request-promise');
// NTOE: assert funcs don't work w/ promises, which never throw...
const Promise = require('bluebird');

const youtubeData = (logger) => {
  const log = logger;

  const options = {
    json: true, // Automatically parses the JSON string in the response
  };

  // get corresponding Youtube video ID of a topic - Khan Academy API
  const getYoutubeID = (title) => {
    options.uri = `http://www.khanacademy.org/api/v1/videos/${title}`;
    return rp(options)
      .then(rawdata => rawdata.translated_youtube_id)
      .catch((err) => {
        log.error(err);
      });
  };

  // get Youtube video detailed info from Youtube API
  // Documentation: https://developers.google.com/youtube/v3/docs/videos
  const getVideoInfo = (videoID) => {
    const baseurl = 'https://www.googleapis.com/youtube/v3/videos';
    const key = process.env.kq_youtube_key;
    // note: can't access 'fileDetails' param unless owner of video
    const reqparts = ['snippet', 'contentDetails', 'statistics'].join('%2C');
    const fullurl = `${baseurl}?id=${videoID}&part=${reqparts}&key=${key}`;
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
          log.info(`No video data available for videoID=${videoID}`);
          return data;
        }
        // remove unnecessary data to reduce file size & process memory usage
        // approx. 80% reduction (tested: 280kb -> 54kb)
        data.etag = 'omit';
        const snip = data.snippet;
        snip.description = 'omit';
        snip.thumbnails = 'omit';
        snip.localized.description = 'omit';

        // make data more suitable for analysis by converting to numbers
        // allows fast & easy querying via built-in operators
        if (snip.publishedAt) {
          const date = snip.publishedAt.split('-');
          const tmp = date[2].split('T');
          snip.publishedAt = {
            year: Number(date[0]),
            month: Number(date[1]),
            day: Number(tmp[0]),
            time: tmp[1],
          };
        }
        // convert all stats to numbers
        const stats = data.statistics;
        if (stats) {
          for (const i in stats) {
            stats[i] = Number(stats[i]);
          }
        }
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
module.exports = youtubeData;
