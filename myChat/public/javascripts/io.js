// 1.イベントとコールバックの定義
var socketio = io.connect('https://'+location.host);
socketio.on('connected', function() { enterRoom();});
socketio.on('publish', function (msg) { addMessage(msg); });
socketio.on('callfor', function (id) { sendOffer(id); });
socketio.on('offer', function (offer) { offerReceived(offer); });
socketio.on('answer', function (answer) { answerReceived(answer); });
socketio.on('icecandy',function (message){iceCandidateReceived(message);});
socketio.on('disconnect', function () {});

console.log("location.host:"+location.host);

function sendV(){
  socketio.emit('voice', { room: currentRoom, name: myName });
}

// 2.イベントに絡ませる関数の定義
function start(name) {
  socketio.emit('connected', name);
}

function enterRoom(){
  socketio.emit('init', { room: currentRoom, name: myName });
}

function publishMessage(recogmsg) {
  if(recogmsg==null){
    var textInput = document.getElementById('msg_input');
    var msg = '[' + myName + '] ' + textInput.value;
    textInput.value = '';
  }
  else{
    var msg = '[' + myName + '] ' + recogmsg;
  }
  socketio.emit('publish', { room: currentRoom, value: msg });
}

function addMessage (msg) {
  var domMeg = document.createElement('div');
  domMeg.innerHTML = new Date().toLocaleTimeString() + ' ' + msg;
  msgArea.appendChild(domMeg);
}