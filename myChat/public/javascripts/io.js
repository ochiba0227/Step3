// 1.イベントとコールバックの定義
var socketio = io.connect('http://'+location.host);
socketio.on('connected', function() { enterRoom();});
socketio.on('publish', function (msg) { addMessage(msg); });
socketio.on('callfor', function (id) { sendOffer(id); });
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

function publishMessage(recogmsg) {
  if(recogmsg==null){
    var textInput = $('#msg_input')[0];
    var msg = '[' + myName + '] ' + textInput.value;
    recogmsg = textInput.value;
    textInput.value = '';
  }
  else{
    var msg = '[' + myName + '] ' + recogmsg;
  }
  socketio.emit('publish', { room: currentRoom, value: msg });
  $.post('/log', {parentID: currentRoom,userName:myName, msgData:recogmsg}, function(res){
  });
}

function addMessage (msg,initflag) {
  if(initflag){
    timeLine.value = msg + timeLine.value;
  }
  else{
    timeLine.value = new Date().toLocaleTimeString() + ' ' + msg + '\n' + timeLine.value;
  }
}