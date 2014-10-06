//getUserMedia()の汎用化
navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

//端末のビデオ、音声ストリームを取得
var context = new AudioContext();
navigator.getMedia ({audio:true }, function(stream) {
  window.source = context.createMediaStreamSource(stream);
console.log('kkkkkkkkkk');
  socketio.emit('voice', {buffer: source});
console.log(source);
  source.connect(context.destination);
}, function(err){ //エラー処理
  console.log('getmedia error!!');
});

function playSound(data){
  console.log(data);
  //data.connect(window.AudioContext);
}