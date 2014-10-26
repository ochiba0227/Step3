$(loaded);

var currentRoom;
var msgArea = document.getElementById('msg');
var myName = '名無し' + Math.floor(Math.random()*10000) + '号';

var wavExported = function(blob) {
  var url = URL.createObjectURL(blob);
  var date = new Date();
  var fname =  date.toISOString() + '.wav';
//  recorder.getBuffer(
//    function (buf){
//      console.log(buf[0]);
//      $.post('upload', {buf: buf[0]}, function(res){
//        console.log("upload:"+res);
//      });
//    }
//  );
  var fd = new FormData();
  fd.append('fname',fname);
  fd.append('data',blob);
recorder.getBuffer(
    function (buf){
      fd.append('buf',buf[0]);
    }
  );

console.log(fd.name);
console.log(fd.value);
console.log(fd.filename);
  $.ajax({
    type: 'POST',
    url: 'upload',
    data: fd,
    processData: false,
    contentType: false
  }).done(function(data) {
     console.log(data);
  });
  recorder.clear();
}

function loaded() {
  currentRoom = localStorage['roomID'];
  addMessage('貴方は' + myName + 'として入室しました');
  start(myName);
}