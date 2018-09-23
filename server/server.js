"use strict";
// Express framework
const express = require('express');
const app = express();
var appState = require('./appState');
const fs = require('fs');
const http = require('http');
const https = require('https');

const rootDir = __dirname + "/..";

const passport = require('passport');
app.use(passport.initialize());

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/class-outis.net/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/class-outis.net/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/class-outis.net/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

// Starting https server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(443, () => {
  console.log('HTTPS server running on port 443');
});

http.createServer((express()).all("*", function (request, response) {
  response.redirect(`https://class-outis.net`);
})).listen(80);

// date time utility
require('date-utils');

// socket io
var io = require('socket.io').listen(httpsServer);

var LocalStrategy = require('passport-local').Strategy;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

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
  res.sendFile('start.html', { root: rootDir + '/client/'});
});

// ログインページ（URLが攻撃者に推測されにくいようにしてある)
app.get('/fyyc9xn29-mw', (req, res) => {
  res.sendFile('login.html', { root: rootDir + '/client/'});
});

app.get('/logout', function(req, res) {
  // メッセージを投稿できなくする
  appState.teacher_login = false;
  io.sockets.emit('quit message');
  res.redirect(`/`);
  
  var routes = app._router.stack;
  routes.forEach(removeMiddlewares);
  function removeMiddlewares(route, i, routes) {
    switch (route.handle.name) {
        case 'classRoomPage':
            routes.splice(i, 1);
    }
    if (route.route)
        route.route.stack.forEach(removeMiddlewares);
  }

  appState.pageID = "";
});

app.post('/enter-class', function(req, res) {
  if(!appState.teacher_login) {
    res.redirect('/');
    return;
  }
  
  if(req.body.class_id)
  {
    res.redirect('/' + req.body.class_id);
  }
  else
  {
    res.redirect('/');
  }
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send({message: err.message});
});

app.post('/login',
    passport.authenticate('local'),
    // ログイン成功時に呼ばれる関数
    function(req, res, next) {
      appState.teacher_login = true;
      appState.pageID = req.body.pageID; //!< login フォームで入力したページID

      // 生徒のログイン用ページ作成
      function classRoomPage (req, res) {
        if(appState.teacher_login)
        {
          res.sendFile('room.html', { root: rootDir + '/client/', isOwner : req.query.isOwner});
        }
        else
        {
          res.redirect('/');
        }
      };
      app.get('/' + appState.pageID, classRoomPage);

      // 先生用のページを表示
      // TODO： 先生用の rootDir を作った方が良いかもしれない
      res.sendFile('teacher.html', { root: rootDir + '/client/'});
    }
);

app.use(function(err, req, res, next) {
  res.redirect('/');
});

// <<< routing

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
