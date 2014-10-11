$(loaded);

var currentRoom;
var msgArea = document.getElementById('msg');
var myName = '名無し' + Math.floor(Math.random()*10000) + '号';

function loaded() {
  currentRoom = localStorage['roomID'];
  addMessage('貴方は' + myName + 'として入室しました');
  start(myName);
}