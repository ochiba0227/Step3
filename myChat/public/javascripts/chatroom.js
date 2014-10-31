$(loaded);

var currentRoom;
var roomName;
var timeLine = $('#timeline')[0];
var userNameHolder;

function loaded() {
  roomName = $('#roomName');
  roomName.text(localStorage['roomName']);
  currentRoom = localStorage['roomID'];
  timeLine.value='';
  addMessage('貴方は' + myName + 'として入室しました');
  //タイムラインの大きさを画面の70%と指定
  var windowY = window.innerHeight ? window.innerHeight: $(window).height();
  $('#timeline').height(windowY*0.7);
  userNameHolder = $('#userNameHolder');
  userNameHolder.val(userNameArea.text());
  //名前が変わったらこっちも変更
  userNameArea.change( function () {
    userNameHolder.val(userNameArea.text());
  });
  $.get('/log', {parentID: currentRoom}, function(res){
    if(res!=false){
      for(var i in res){
        addMessage (new Date(res[i].date).toLocaleTimeString() + ' ' + '[' + res[i].userName + '] ' + res[i].logText + '\n', true);
      }
    }
  });
  start(myName);
}