"use strict";

// teacher only URL pattern
var reg = new RegExp("((https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+))");

var socket = io();

var chat = {};
chat.view = function() {
  return m("div.blank_box", [
          chat.vm.list.map(function(data, i){
            if(data.isTeacher)
            {
              // 先生は右側
              if(data.message.match(reg))
              {
                return m('div#teacher.ui right floated large segment', [
                  m("i.red thumbs up outline large icon")
                  , m("a", {href: data.message, target: '_blank'},[data.message])
                ]);
              }
              else
              {
                return m('div#teacher.ui right floated large segment', [
                  m("i.red thumbs up outline large icon")
                  , data.message
                ]);
              }
            }
            else
            {
              // 生徒は左側で背景色を互い違いに
              let cls = (i % 2 === 0) ? '.ui left ou_even floated large segment' : '.ui left ou_odd floated large segment';
              
              return m('div' + cls, [
                m('i.smile large icon')
                , data.message]);
            }
          })
        ]);
}

chat.vm = new function () {
  // vm が戻り値
  var vm = {};

  vm.init = function () {
    // チャットメッセージリスト
    vm.list = new Array();

    // 送信ボタン
    vm.send = function() {
      let e = document.getElementById("inputForm");
      if (e.value) {
        socket.emit('chat message', {message: e.value});
        e.value = "";
      }
    }

    // サーバからのデータ受信
    vm.listen = (function() {
      socket.on('chat message', function(data) {
        try {
          if(data.message) {
            vm.list.push(data);
          }
        } catch(e) {
          alert('there is a problem: ', e);
        } finally {
          // 外部イベントハンドラから処理が来た場合には再描画を明示的に呼ぶ必要がある
          m.redraw();
          // ダサいけどこれで一番下までスクロール
          $('#wrapper').delay(100).animate({
            scrollTop: 100000000
          },500);
        }
      });

      socket.on('quit message', function() {
        window.location.href='/';
      });
    }) ()
  }
  return vm;
}

chat.oninit = function() {
  chat.vm.init();
}

var buttons = {};
buttons.view = function() {
  // 送信ボタン
  var rChildren = [m("div#sendButton.ui teal right labeled icon button",
  {onclick: m.withAttr('value', chat.vm.send)},
  [m("i.send icon"), "送信"])];

  return m("div.row", [
      m("div.twelve wide column",
        m("textarea#inputForm",{placeholder: "メッセージを入力", type: "text", autocomplete: "off"})
      ),
      m("div.four wide column", rChildren)
    ]);
};

buttons.oninit = function() {
  buttons.view();
}

var dom_messages = document.getElementById("messages");
m.mount(dom_messages, chat);

var dom_buttons = document.getElementById("sender");
m.mount(dom_buttons, buttons);
