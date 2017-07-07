'use strict';

// custom logger
const log = require('./logger.js');
// custom db manager
// const db = require('./dbManager.js')(log);

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


const KhanQuality = new require('./khanquality.js')(log);
KhanQuality.execute();
