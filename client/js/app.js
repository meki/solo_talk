"use strict";

function ShowText(str)
{
  var message = document.getElementById( 'inputForm' );
  message.value = str;
}

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if( ! window.SpeechRecognition )
{
  ShowText('お使いのブラウザでは、Speech APIはサポートされていません。');
}

var recognition = new window.SpeechRecognition();
// recognition.interimResults = true;
recognition.continuous = true;

var isContinuousMode = true;

recognition.onerror = function( event )
{
  if( event.error != 'aborted' ) {
    ShowText('ERROR:' + event.error);
  }
}

recognition.onend = function(event)
{
  if(isContinuousMode) {
    ShowText("再スタート");
    recognition.start();
  } 
}

// onnomatch を入れると認識が失敗した結果も入る
recognition.onnomatch = recognition.onresult = function( event )
//recognition.onresult = function( event )
{
  let results = event.results;
  let len = results.length;
  if(results.length > 0) {
    socket.emit('chat message', {message: event.results[len - 1][0].transcript});
  }
}

var imageIdx = 0;
function switchImage() {
  let img = document.getElementById("image_panel");
  img.src = "/img/" + ("000" + imageIdx).slice(-3) + ".jpg";
}

//////////////////////

var socket = io();

var chat = {};
chat.view = function() {
  return m("div.blank_box", [
          chat.vm.list.map(function(data, i){

            let cls = (i % 2 === 0) ? '.ui left ou_even floated large segment' : '.ui left ou_odd floated large segment';
            
            return m('div' + cls, [
              m('i.smile large icon')
              , data.message]);
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
      /*let e = document.getElementById("inputForm");
      if (e.value) {
        socket.emit('chat message', {message: e.value});
        e.value = "";
      }*/
      isContinuousMode = true;
      recognition.start();
      ShowText("音声認識開始")
      setInterval(() => {
        imageIdx++;
        switchImage();
      }, 60000);
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
      [m("i.send icon"), "開始"]
    ),
    m("div#logoutButton.ui red right labeled icon button",
      {onclick: function(){
        isContinuousMode = false;
        recognition.abort();
        ShowText("終了");
      }},
      [m("i.sign out alternate icon"), "終了"]
    )];

  return m("div.row", [
      m("div.twelve wide column",
        m("textarea#inputForm",{placeholder: "", type: "text", autocomplete: "off"})
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
