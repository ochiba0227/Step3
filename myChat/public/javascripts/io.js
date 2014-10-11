// 1.イベントとコールバックの定義
var socketio = io.connect('http://'+location.host);
socketio.on('connected', function() { enterRoom();});
socketio.on('publish', function (msg) { addMessage(msg); });
socketio.on('offer', function (offer) { offerReceived(offer); });
socketio.on('answer', function (answer) { answerReceived(answer); });
socketio.on('icecandy',function (message){iceCandidateReceived(message);});
socketio.on('disconnect', function () {});

// 2.イベントに絡ませる関数の定義
function start(name) {
  socketio.emit('connected', name);
}

function enterRoom(){
  socketio.emit('init', { room: currentRoom, name: myName });
}

function publishMessage() {
  var textInput = document.getElementById('msg_input');
  var msg = '[' + myName + '] ' + textInput.value;
  socketio.emit('publish', { room: currentRoom, value: msg });
  textInput.value = '';
}

function addMessage (msg) {
  var domMeg = document.createElement('div');
  domMeg.innerHTML = new Date().toLocaleTimeString() + ' ' + msg;
  msgArea.appendChild(domMeg);
}