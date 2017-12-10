"use strict";
// Express framework
const express = require('express');
const app = express();
app.set('port', process.env.PORT || 3000);

const rootDir = __dirname + "/..";

const passport = require('passport');
app.use(passport.initialize());


const server = app.listen(app.get('port'));
console.log("server listening on port " + app.get('port'));

// date time utility
require('date-utils');

// socket io
var io = require('socket.io').listen(server);



var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(function (username, password, done) {
  // ここで username と password を確認して結果を返す
  
  let isSuccess = (username ==='minamitani' && password === 'zyxw');
  if (!isSuccess) {
      return done(null, false, {message: 'ログインに失敗しました。'});
  }
  else {
      return done(null, username);
  }
}));

// set static file dir
app.use(express.static('client'));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: rootDir + '/client/'});
});

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: rootDir + '/client/'});
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send({message: err.message});
});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login',
    passport.authenticate('local'), /*{ failureRedirect: '/login',
                                      failureFlash: false,
                                      session: false },*/
    function(req, res, next) {
      res.redirect('/');
      io.emit('chat message', {message: 'ログイン成功', isTeacher: false});
    }
);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var connectCount = 0;
var teacherId = "";
io.on('connection', (socket) => {
  let dt = new Date();
  connectCount += 1;
  console.log('%s > user %s connected\nuser count = %d', dt.toFormat("YYYY/MM/DD:HH24:MI:SS"), socket.id, connectCount);

  socket.on('chat message', (msg) => {
    // 南モードを設定する（div の背景色が変わるだけだが）
    const teacherCode = "373t";

    if(msg.message) {
      if(msg.message === teacherCode) { 
        teacherId = socket.id;
        msg.message = "<teacher login>";
      }

      io.emit('chat message', {message: msg.message, isTeacher: (socket.id === teacherId) ? true : false});
    }
  });

  socket.on('disconnect', () => {
    connectCount -= 1;
    console.log('%s > user %s disconnected\nuser count = %d', dt.toFormat("YYYY/MM/DD:HH24:MI:SS"), socket.id, connectCount);
  });
});
