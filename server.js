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
server.listen(port, () => {
  log.info(version);
  log.info(`Listening on port ${port}`);
});

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


/*
// ex. using 'request-promise' to call JSON REST API
var rp = require('request-promise');
var options = {
  uri: 'https://api.github.com/user/repos',
  qs: {
    access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
  },
  headers: {
    // spoof user-agent
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
  },
  json: true // Automatically parses the JSON string in the response
};

rp(options)
  .then(function (data) {
    console.log('User has %d repos', repos.length);
  })
  .catch(function (err) {
    // API call failed...
  });
  */
