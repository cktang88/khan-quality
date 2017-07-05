'use strict';

const Promise = require('bluebird');

// custom logger
const log = require('./logger.js');

const express = require('express');

const app = express();

app.use(require('helmet')()); // use helmet
app.use(require('cors')()); // enable CORS
// serves all static files in /public
app.use(express.static(`${__dirname}/public`));
const port = process.env.PORT || 8000;
const server = require('http').Server(app);

// boilerplate version
const version = `Express-Boilerplate v${require('./package.json').version}`;

// start server
/*
server.listen(port, () => {
  log.info(version);
  log.info(`Listening on port ${port}`);
});
*/
/*
const processWord = (word, socket) => {
  if (!socket) {
    log.error('Socket is undefined.');
  }
}

// SOCKET.IO
const io = require('socket.io').listen(server);

io.on('connection', (socket) => {
  log.info('new connection.');

  // emit an event to the socket
  socket.emit('message', version);

  // emit an event to ALL connected sockets
  // io.emit('broadcast', data);

  // listen to events
  socket.on('newword', (word) => {
    log.info(word);
    processWord(word, socket);
  });
  socket.on('disconnect', (e) => {
    log.info('user disconnected.');
  });
});


// 'body-parser' middleware for POST
const bodyParser = require('body-parser');
// create application/json parser
const jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({
  extended: false,
});

// POST /login gets urlencoded bodies
app.post('/login', urlencodedParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  res.send(`welcome, ${req.body.username}`);
});

// POST /api/users gets JSON bodies
app.post('/api/users', jsonParser, (req, res) => {
  if (!req.body) return res.sendStatus(400);
  // create user in req.body
});

*/

// the entire topic tree is 30mb :(

const rp = require('request-promise');
const go = res => {
    //console.log(res.children);
    res.children.forEach((entry, index) => {
      const val = String(entry.node_slug);

      if (val.indexOf('/') > -1) {
        // eg. "e/..." or "a/..." or "v/..."
        // these signify leaf of tree branch, is not a topic with children
        console.log(val);
      } else {
        console.log('> ' + val);
        //getTopic(val);
      }
    });
  }
// breadth-first search of tree
const getTopic = topic => {
  const options = {
    uri: 'http://www.khanacademy.org/api/v1/topic/' + topic,
    headers: {
      // spoof user-agent
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
    },
    json: true // Automatically parses the JSON string in the response
  };
  // ex. using 'request-promise' to call JSON REST API
  rp(options)
    .then(data => {
      console.log('got data')
      go(data);
    })
    .catch(err => {
      console.log(err);
      // API call failed...
    });
}

getTopic('cells');


// TODO:
/*

Youtube API:
1. get all playlists of username (khanacademy)
2. for each video, get title, comments?, upvotes, downvotes, # views

Khan Academy API:

can access specific videos, get Youtube URL from here
can access topictree, playlists, etc.

*/

// ewww disgusting --> convert all to es6 please
// narrowed down to root=mcat to just prove point
//get topic="mcat"