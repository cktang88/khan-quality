'use strict'

/* Collects data from Khan Academy and Youtube APIs 
   Intended to be run once.
*/

// custom logger --> share one instance across all modules/files
const log = require('./logger.js');

const KhanQuality = require('./khanquality.js')(log);
// the entire topic tree is 30mb :(
// start off with a root (proof of concept)
KhanQuality.execute('cells');
// global-art-architecture: 19 videos
// cells: 61 videos
// humanities: 2465 videos