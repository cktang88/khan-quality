// socket.io setup

'use strict';

const socket = io();
socket.on('connect', () => {
  console.log('connected to server.');
  socket.emit('newword', 'Hello! I am a new client testing out messaging.');
});
socket.on('disconnect', () => {
  console.log('disconnected.');
});

// NOTE: websockets do not guarantee that info arrives in same order it was sent
// nor does server send info in series in order
socket.on('message', (data) => {
  console.log(data);
});


$(document).ready(() => {
// dom loaded
});

const getdata1 = function () {
  return ['hello', 'bye'];
};

const getdata2 = function () {
  const arr = [];
  for (let i = 0; i < 10; i += 1) {
    arr.push(i);
  }
  return arr;
};

// vue.js
window.app = new Vue({
  el: '#app',
  data: {
    collection: getdata1(),
    otherstuff: getdata2(),
  },
  filter: {

  },
  computed: {

  },
  watch: {

  },
  methods: {

  },
});
