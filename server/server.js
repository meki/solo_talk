"use strict";
const express = require('express');
require('date-utils');
const app = express();
const server = app.listen(3000);
const io = require('socket.io').listen(server);
const rootDir = __dirname + "/..";

app.set('port', process.env.PORT || 3000);
console.log("server listening 3000...");

const passport = require('passport');
app.use(passport.initialize());

var authStrategy = require('passport-local').Strategy;
passport.use(new authStrategy(function(username, password, done){
    // ここで username と password を確認して結果を返す
    if (なんらかのエラー) {
      return done(エラー内容);
  }
  else if (失敗) {
      return done(null, false);
  }
  else if (成功) {
      return done(null, username);
  }
}));

// set static file dir
app.use(express.static('client'));

app.get('/', (req, res) => {
  res.sendFile('client/index.html', { root: rootDir });
});

// var validator = require('validator'); 

var connectCount = 0;
var teacherId = "";
io.on('connection', (socket) => {
  let dt = new Date();
  connectCount += 1;
  console.log('%s > user %s connected\nuser count = %d', dt.toFormat("YYYY/MM/DD:HH24:MI:SS"), socket.id, connectCount);

  socket.on('chat message', (msg) => {
    // 南モードを設定する（div の背景色が変わるだけだが）
    const teacherCode = "373t";

    if(msg) {
      if(msg === teacherCode) { 
        teacherId = socket.id;
        msg = "<teacher login>";
      }

      io.emit('chat message', {message: msg, isTeacher: (socket.id === teacherId) ? true : false});
    }
  });

  socket.on('disconnect', () => {
    connectCount -= 1;
    console.log('%s > user %s disconnected\nuser count = %d', dt.toFormat("YYYY/MM/DD:HH24:MI:SS"), socket.id, connectCount);
  });
});
