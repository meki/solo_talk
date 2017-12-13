"use strict";

var chat = {};
var socket = io();

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
        }
      })
    }) ()
  }
  return vm;
}

chat.oninit = function() {
  chat.vm.init();
}

var cmpLowerBtn = {
  view: function() {
    return m("div#sender.ui padded grid",
      m("div.row", [
        m("div.twelve wide column",
          m("textarea#inputForm",{placeholder: "メッセージを入力", type: "text", autocomplete: "off"})
        ),
        m("div.four wide column",
          m("div#sendButton.ui teal right labeled icon button",
            {onclick: m.withAttr('value', chat.vm.send)},
            [m("i.send icon"), "送信"]
          )
        )
      ])
    );
  }
}

chat.view = function(ctrl) {
  return m("div#wrapper",
            [m("div#messages", [
              chat.vm.list.map(function(data, i){
                if(data.isTeacher)
                {
                  // 先生は右側
                  return m('div#teacher.ui right floated large segment', [
                    m("i.white student icon")
                    , data.message
                  ]);
                }
                else
                {
                  // 生徒は左側で背景色を互い違いに
                  let cls = (i % 2 === 0) ? '.ui left ou_even floated large segment' : '.ui left ou_odd floated large segment';
                  
                  return m('div' + cls, [
                    m('i.smile icon')
                    , data.message]);
                }
              })
            ]),
            m(cmpLowerBtn)]
          );
}

var root = document.body;
m.mount(root, chat);

var ee = document.createElement("i");
if(data.isTeacher) {
  ee.className = 'white student icon';
  e.id = 'teacher'
}
else {
  ee.className = 'smile icon';
}
e.appendChild(ee);