$(loaded);
var id;
var socketio = io.connect('http://'+location.host);
socketio.on('connected', function(data) {id=data});
socketio.on('return', function(data) {console.log(data);});

function upload(file){
  var fileReader = new FileReader();
  var send_file = file;
  //wavのみなので不要
  //var type = send_file.type;
  if((send_file.type + " ").indexOf("wav ") == -1) {
    console.log(send_file.type);
    return;//wav以外ならreturn
  }
  var data = {};
  var date = new Date();
  fileReader.readAsBinaryString(send_file);
  fileReader.onload = function(event) {
    data.file = event.target.result;
    data.name = id + date.getMinutes() + date.getSeconds();
    //data.type = type;
    socketio.emit('upload',data);
  }
}

function loaded() {
  //fileinputが変わったら
  $("#fileInput").change(function(event){
    var file = event.target.files[0];
    upload(file);//ファイルを送る関数
  });
}