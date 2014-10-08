//getUserMedia()の汎用化
navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
window.URL = window.URL || window.webkitURL;
//端末のビデオ、音声ストリームを取得
var context = new AudioContext();
//ノイズ対策ローパスフィルタ
var lowpassFilter = context.createBiquadFilter();
lowpassFilter.type = 0;
lowpassFilter.frequency.value = 440;

var audioAnalyser = context.createAnalyser();
var audioAnalyzedData = new Float32Array(audioAnalyser.frequencyBinCount);

navigator.getMedia ({audio:true }, function(stream) {
  //入力ソースの作成(マイクからの入力)
  var mediaStreamSource = context.createMediaStreamSource(stream);
  //アナライザと自身のスピーカーに接続
  mediaStreamSource.connect(audioAnalyser);
//  mediaStreamSource.connect(context.destination);

  setInterval(function(){
    audioAnalyser.getFloatFrequencyData(audioAnalyzedData);
    //socketio.emit('voice', audioAnalyzedData);
    //socketio.emit('voice', mediaStreamSource);
    //console.log(mediaStreamSource);
    //console.log(audioAnalyzedData);
  },100);
}, function(err){ //エラー処理
  console.log('getmedia error!!');
});

function playSound(data){
  console.log('data:');
  console.log(data);
}