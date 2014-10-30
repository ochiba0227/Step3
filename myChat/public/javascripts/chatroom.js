$(loaded);

var currentRoom;
var timeLine = $('#timeline')[0];

function loaded() {
  currentRoom = localStorage['roomID'];
  addMessage('貴方は' + myName + 'として入室しました');
  //タイムラインの大きさを画面の70%と指定
  var windowY = window.innerHeight ? window.innerHeight: $(window).height();
  $('#timeline').height(windowY*0.7);
  start(myName);
}