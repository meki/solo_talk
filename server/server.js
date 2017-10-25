const express = require('express');
require('date-utils');
const app = express();
// const http = require('http').Server(app);
// const io = require('socket.io')(http);
const server = app.listen(3000);
var io = require('socket.io').listen(server);
const rootDir = __dirname + "/..";

app.set('port', process.env.PORT || 3000);
console.log("server listening 3000...");

// set static file dir
app.use(express.static('client'));

app.get('/', (req, res) => {
  res.sendFile('client/index.html', { root: rootDir });
});

io.on('connection', (socket) => {
  let dt = new Date();
  console.log(dt.toFormat("YYYY/MM/DD:HH24:MI:SS") + '> user connected');

  socket.on('chat message', (msg) => {
    if(msg) {
      // msg.replace(/\r?\n/g, '<br>');
      io.emit('chat message', msg);
    }
  });

  socket.on('disconnect', () => {
    console.log(dt.toFormat("YYYY/MM/DD:HH24:MI:SS") + '> user disconnected');
  });
});

/*
app.listen(app.get('port'), () => {
  console.log('Listening on port ' + app.get('port'));
});*/