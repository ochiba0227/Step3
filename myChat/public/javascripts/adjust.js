$(init);

//getUserMedia()の汎用化
navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

//録音用
var audioContext;
var recorder;
//サンプリング周波数
var sampleRate;

//ノイズ対策のローパスフィルタの作成
var lowpassFilter;
var lowpassFreq=2000;

//音量検出
var analyser;
var fftSize = 1024;

//自身のストリーム．無いとFirefoxは止まる
var localMediaStream;

//波形を表示する部分
var visualCanvas = null;
var visualContext = null;

//閾値を調整するスライダー
var sliderObj = null;

function init(){
  $('#saveThresholdButton')[0].addEventListener("click", saveThreshold);
  var minVol = localStorage['minVol'];
  var maxVol = localStorage['maxVol'];
  if(!minVol){
    minVol=100;
  }
  if(!maxVol){
    maxVol=120;
  }
  sliderObj=$('#slider');
  sliderObj.slider({
    values:[ minVol , maxVol ],
    min:0,
    max:255,
    step:1,
    range:true 
  });

  visualCanvas = $('#visual')[0];
//  visualCanvas.width = 200;
//  visualCanvas.height = 25;
  visualContext = visualCanvas.getContext('2d');
  //端末のビデオ、音声ストリームを取得
  navigator.getMedia ({audio:true }, function(stream) {
    //streamをグローバル変数に
    localMediaStream=stream;

    //録音用設定
    audioContext = new AudioContext();
    sampleRate = audioContext.sampleRate;
    var input = audioContext.createMediaStreamSource(stream);
    lowpassFilter = audioContext.createBiquadFilter();
    lowpassFilter.type = 0;
    lowpassFilter.frequency.value = lowpassFreq;

    analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeContant = 0.9;

    input.connect(lowpassFilter);
    lowpassFilter.connect(analyser);
    setInterval(visualUpdate, 100);
  }, function(err){ //エラー処理
    console.log('getmedia error!!');
  });
}

function visualUpdate() {
  if (!analyser) {
    return;
  }
  var i=0,sum=0;
  visualContext.fillStyle = "rgb(0,0,0)";
  visualContext.fillRect(0, 0, 256, 25);
  var data = new Uint8Array(256);
  analyser.getByteFrequencyData(data);
  //lowpassFreq以下の音量を平均
  while(sampleRate*(i+1)/fftSize<lowpassFreq){
    sum+=data[i];
    i++;
  }
  //スライドバーから閾値を取得
  var values = sliderObj.slider( "option", "values" );
  //音量の平均データを描画。閾値内外で色変化
  sum=sum/i;
  if(sum>=values[0]&&sum<=values[1]){
    visualContext.fillStyle = "rgb(0,0,255)";
  }
  else{
    visualContext.fillStyle = "rgb(255,0,0)";
  }
  visualContext.fillRect(0, 0, sum, 25);

  //閾値の線を描画
  visualContext.fillStyle = "rgb(0,255,255)";
  visualContext.fillRect(values[0], 0, 2, 25);
  visualContext.fillRect(values[1], 0, 2, 25);
}

function saveThreshold() {
  var conf = confirm('閾値を設定します。');
  if ( conf == true ){
    var values = sliderObj.slider( "option", "values" );
    //閾値をローカルストレージに保存
    localStorage.setItem('minVol', values[0]);
    localStorage.setItem('maxVol', values[1]);
    alert('設定しました。');
    history.back();
  }
}