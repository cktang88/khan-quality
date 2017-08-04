/*
Purpose: Get part of Khan Academy topic tree
Parameters:
  logger - logger instance (only supports Bunyan logger)
  nested - set to true to return topic tree as nested array, set to false to return as flat array.

Sample usage:
  const kaTopicTree = require('./ka-topic-tree.js')(loggerInstance, false);
  kaTopicTree.getFromAPI('cells')
    .then(results => {
      // do something with results
    })
*/

'use strict';

const kaTopicTree = (logger, nested) => {
  const rp = require('request-promise');
  const Promise = require('bluebird');
  const log = logger;

  // breadth-first search
  // these two functions represent a RECURSIVE PROMISE
  // processes data, returns array of strings
  const processData = rawdata =>
    // returns array of fulfillment values when all completed (fulfilled/rejected)
    // Promise.map = Promise.all(arr.map)
    Promise.map(rawdata.children, (entry, index) => {
      const val = String(entry.node_slug);
      if (val.indexOf('/') > -1) {
        // eg. if begins with "e/..." or "a/..." or "v/..." are leaves of topic tree
        // a = article, e = excercise, v = video
        const tmp = val.split('/');
        if (tmp[0] === 'v') { // only output videos to array
          // returns an array of objects
          return {
            title: tmp[1],
          };
        }
      } else {
        // log.info(`> ${val}`);
        return getTopicTree(val);
      }
      // default
      return undefined;
    }, {
      concurrency: 5,
    })
    .filter(item => item !== undefined);


  const options = {
    json: true, // Automatically parse JSON string response
  };

  // get topic tree from given root topic - Khan Academy API
  const getTopicTree = (topic) => {
    options.uri = `http://www.khanacademy.org/api/v1/topic/${topic}`; // add url param
    // using 'request-promise' to call JSON REST API
    return rp(options)
      .then((rawdata) => {
        log.info(`Got data for ${topic}`);
        const data = processData(rawdata);
        // flatten any nested arrays as we go if nested===false
        return nested ? data : data.reduce((a, b) => a.concat(b), []);
      })
      .catch(err => log.error(err));
  };

  return {
    getFromAPI: getTopicTree,
  };
};

module.exports = kaTopicTree;
