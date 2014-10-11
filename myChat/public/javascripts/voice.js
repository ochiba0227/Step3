//getUserMedia()の汎用化
navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
window.URL = window.URL || window.webkitURL;
var peerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
window.RTCPeerConnection = peerConnection;

window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

//端末のビデオ、音声ストリームを取得
var context = new AudioContext();
var localMediaStream;

//リモートのメディアストリーム
var mediaStreamSource;

//自身のピアを作成
var peer = new peerConnection({iceServers: [{url: "stun:stun.l.google.com:19302"}]});
console.log(peer);

navigator.getMedia ({audio:true }, function(stream) {
  //入力ソースの作成(マイクからの入力)
  //var mediaStreamSource = context.createMediaStreamSource(stream);
  //自身のスピーカーに接続
  //mediaStreamSource.connect(context.destination);
//socketio.emit('voice',stream);
  //streamをグローバル変数に
  localMediaStream=stream;
  //自身のストリームをP2Pコネクションに追加
  peer.addStream(localMediaStream);
  //sendChannel = peer.createDataChannel("sendDataChannel", {reliable: false});
}, function(err){ //エラー処理
  console.log('getmedia error!!');
});

//------ここはoncreateに入れる予定--------
  //自身のストリームの送信
  peer.onicecandidate = function(evt) {
      if (evt.candidate) {
          socketio.emit('icecandy',{ room: currentRoom, icecandy: new RTCIceCandidate(evt.candidate)});
      } else {
          console.log('onicecandidate with no candidate');
          console.log(evt);
      }
  }
  //ストリームの準備ができたとき
  peer.onaddstream=function(stream){
console.log('onaddstream');
console.log(stream.stream);
//remotestreamをconnectすることができない←chromeのバグ
//    var mediaStreamSource = context.createMediaStreamSource(stream.stream);
//    mediaStreamSource.connect(context.destination);
//audioelementを作ってそこにストリームを投げる場合は再生される
    var audio_elem = document.createElement("audio");
    audio_elem.src = URL.createObjectURL(stream.stream);
    audio_elem.play();
  }
//--------------

function sendOffer(){
  peer.createOffer(function(desc) {
console.log('offer');
console.log(desc);
    peer.setLocalDescription(desc);
    socketio.emit('offer',{ room: currentRoom, desc: desc });
  }, error);
}

function offerReceived(offer) {
    peer.setRemoteDescription(new RTCSessionDescription(offer));
    peer.createAnswer(function(answer) {
console.log('createAns');
console.log(answer);
        peer.setLocalDescription(answer);
        socketio.emit('answer',{ room: currentRoom, answer: answer });
    }, function(){console.log('error:createAns');});
}
 
function answerReceived(answer) {
console.log('ansrcv');
console.log(new RTCSessionDescription(answer));
    peer.setRemoteDescription(new RTCSessionDescription(answer));
}

function iceCandidateReceived(message) {
    var candidate = new RTCIceCandidate(message);
console.log('iceCandidateReceived');
console.log(candidate);
    peer.addIceCandidate(candidate);
}

function error(){
  console.log('error');
}