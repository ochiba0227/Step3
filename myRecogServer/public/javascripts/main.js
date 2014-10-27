﻿$(loaded);

navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

var id;
var socketio = io.connect('https://'+location.host);
socketio.on('connected', function(data) {id=data});
socketio.on('return', function(data) {$('#list').append('<li>' + data + '</li>');});

var audioContext;
var recorder;
var lowpassFilter;


function upload(file){
  var fileReader = new FileReader();
  var send_file = file;

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
  navigator.getMedia({video: false, audio: true}, function(stream) {
    audioContext = new AudioContext();
    audioStream = stream;
    var input = audioContext.createMediaStreamSource(audioStream);
    lowpassFilter = audioContext.createBiquadFilter();
    lowpassFilter.type = 0;
    lowpassFilter.frequency.value = 20000;
    input.connect(lowpassFilter);
    recorder = new Recorder(lowpassFilter, { workerPath: 'javascripts/recorderWorker.js' });
    captureStart();
  },function(err){console.log(err);});
}

function captureStart(){
    console.log("capstart");
    recorder && recorder.record();
    setTimeout('captureStop()', 5000);
}

function captureStop(){
    recorder && recorder.stop();
    recorder && recorder.exportWAV(wavExported);
}

//サーバへwavファイルをアップロードする
function wavExported(blob) {
    upload(blob);
    //clearより先にcapturestartが走ってしまう．
    recorder.clear();
    captureStart();
}