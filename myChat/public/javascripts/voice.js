//getUserMedia()の汎用化
navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
window.URL = window.URL || window.webkitURL;
var peerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
window.RTCPeerConnection = peerConnection;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

//録音用
var audioContext;
var recorder;

//ノイズ対策のローパスフィルタの作成
var lowpassFilter;

//自身のストリーム
var localMediaStream;

//ピアを作成
var peer = new Array();

//他ユーザの音声
var audio_elem = new Array();

//端末のビデオ、音声ストリームを取得
navigator.getMedia ({audio:true }, function(stream) {
  //streamをグローバル変数に
  localMediaStream=stream;

  //録音用設定
  audioContext = new AudioContext();
  var input = audioContext.createMediaStreamSource(stream);
  lowpassFilter = audioContext.createBiquadFilter();
  lowpassFilter.type = 0;
  lowpassFilter.frequency.value = 20000;
  input.connect(lowpassFilter);
  recorder = new Recorder(lowpassFilter, { workerPath: 'javascripts/recorderWorker.js' });
}, function(err){ //エラー処理
  console.log('getmedia error!!');
});

//各ピアに接続要求を投げるよう要求
function callMe(){
  socketio.emit('callme',{ room: currentRoom });
}

//接続要求を投げる
function sendOffer(id){
  //ピアの設定
  setPeerData(id);

  peer[id].createOffer(function(desc) {
console.log('offer');
console.log(desc);
console.log(id);
console.log(peer);
    peer[id].setLocalDescription(desc);
    socketio.emit('offer',{ room: currentRoom, desc: desc, id:id });
  }, function(){
    //ストリームが無い場合(受信のみを行う場合)
    console.log('receive only');
    socketio.emit('callme',{ room: currentRoom });
  });
}

//接続要求を受信したら返事する
function offerReceived(offer) {
console.log('offerrec');
console.log(offer.id);
  //ピアの設定
  setPeerData(offer.id);

  //offer.idが示すピアにoffer.deskを設定
  if(offer.desc!=null){
    peer[offer.id].setRemoteDescription(new RTCSessionDescription(offer.desc));
  }
  else{
    console.log('send only:'+offer.id);
  }

  peer[offer.id].createAnswer(function(answer) {
console.log('createAns');
console.log(answer);
      peer[offer.id].setLocalDescription(answer);
      socketio.emit('answer',{ room: currentRoom, answer: answer, id:offer.id });
  }, function(){console.log('error:createAns');});
}

//接続要求に対して答えが返ってきたら相手のストリームをピアにセット
function answerReceived(answer) {
console.log('ansrcv');
console.log(answer.id);
console.log(new RTCSessionDescription(answer.desc));
  peer[answer.id].setRemoteDescription(new RTCSessionDescription(answer.desc));
console.log(peer[answer.id]);
}

function iceCandidateReceived(message) {
  // オブジェクトをicecandidate型に変換
  var candidate = new RTCIceCandidate(message.icecandy);
console.log('iceCandidateReceived');
console.log(peer);
console.log(message.id);
  peer[message.id].addIceCandidate(candidate);
}

function error(){
  console.log('error');
}

function setPeerData(id){
  // ピアの作成　一度だけ！
  if(peer[id]==null){
    peer[id] = new peerConnection({iceServers: [{url: "stun:stun.l.google.com:19302"}]});
    //自身のストリームをP2Pコネクションに追加
    if(localMediaStream!=null){
      peer[id].addStream(localMediaStream);
    }
    //自身のストリームの送信
    peer[id].onicecandidate = function(evt) {
        if (evt.candidate) {
            socketio.emit('icecandy',{ room: currentRoom, icecandy: new RTCIceCandidate(evt.candidate), id:id});
        } else {
            console.log('onicecandidate with no candidate');
            console.log(evt);
        }
    }

    //他ユーザのストリームの準備ができたとき
    peer[id].onaddstream=function(stream){
  console.log('onaddstream');
  console.log(stream.stream);
  //remotestreamをconnectすることができない←chromeのバグ
  //    var mediaStreamSource = context.createMediaStreamSource(stream.stream);
  //    mediaStreamSource.connect(context.destination);
  //audioelementを作ってそこにストリームを投げる場合は再生される
      audio_elem[id] = document.createElement("audio");
      audio_elem[id].src = URL.createObjectURL(stream.stream);
      audio_elem[id].play();
  console.log(audio_elem);
    }
  }
  else{
     console.log('peer is already created');
  }
}