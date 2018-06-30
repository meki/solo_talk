"use strict";
// Express framework
const express = require('express');
const app = express();
var appState = require('./appState');
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

// ここで username と password を確認して結果を返す
passport.use(new LocalStrategy(function (username, password, done) {
  let isSuccess = (username ==='minami' && password === 'jamesPapipupupepepo');
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
  // 必ずログインページに飛ばす
  res.sendFile('login.html', { root: rootDir + '/client/'});
});

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: rootDir + '/client/'});
});

app.get('/logout', function(req, res) {
  // メッセージを投稿できなくする
  appState.teacher_login = false;
  res.sendFile('login.html', { root: rootDir + '/client/'});
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send({message: err.message});
});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login',
    passport.authenticate('local'),
    // ログイン成功時に呼ばれる関数
    function(req, res, next) {
      appState.teacher_login = true;
      appState.pageID = req.body.pageID; //!< login フォームで入力したページID

      // 生徒のログイン用ページ作成
      app.get('/' + appState.pageID, (req, res) => {
        res.sendFile('home.html', { root: rootDir + '/client/', isOwner : req.query.isOwner});
      });

      // 先生用のページを表示
      // TODO： 先生用の rootDir を作った方が良いかもしれない
      res.sendFile('teacher.html', { root: rootDir + '/client/'});

      // TODO: npm install --save sleep-async をインストールして（今はエラーが発生して出来ない）
      // ここで3秒くらい待った後に生徒ログイン用 url を io.emit してあげたい
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
// html 側で io() が呼ばれたときにこれが呼ばれる
io.on('connection', (socket) => {

  let dt = new Date();
  connectCount += 1;
  console.log('%s > user %s connected\nuser count = %d', dt.toFormat("YYYY/MM/DD:HH24:MI:SS"), socket.id, connectCount);

  socket.on('chat message', (msg) => {
    if(!appState.teacher_login) { return; }
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

  socket.on('teacher message', (msg) => {
    if(!appState.teacher_login) { return; }

    if(msg.message) {
      io.emit('chat message', {message: msg.message, isTeacher: true});
    }
  });

  socket.on('disconnect', () => {
    connectCount -= 1;
    console.log('%s > user %s disconnected\nuser count = %d', dt.toFormat("YYYY/MM/DD:HH24:MI:SS"), socket.id, connectCount);
  });
});
