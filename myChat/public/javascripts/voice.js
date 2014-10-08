//getUserMedia()の汎用化
navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
window.URL = window.URL || window.webkitURL;
var PeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
window.RTCPeerConnection = PeerConnection;

//端末のビデオ、音声ストリームを取得
var context = new AudioContext();
var localMediaStream;

//リモートのメディアストリーム
var mediaStreamSource;

//送信用のチャンネル
var sendChannel;

//チャンネルを使う設定
var peerDataConnectionConfig = {
    "optional" : [
        { "RtpDataChannels" : true }
    ]
};

//自身のピアを作成
var peer = new PeerConnection({iceServers: [{url: "stun:stun.l.google.com:19302"}]});
console.log(peer);

navigator.getMedia ({audio:true }, function(stream) {
  //入力ソースの作成(マイクからの入力)
  //var mediaStreamSource = context.createMediaStreamSource(stream);
  //自身のスピーカーに接続
  //mediaStreamSource.connect(context.destination);
//socketio.emit('voice',stream);
console.log(stream);
  //streamをグローバル変数に
  localMediaStream=stream;
  //自身のストリームをP2Pコネクションに追加
  peer.addStream(localMediaStream);
  //sendChannel = peer.createDataChannel("sendDataChannel", {reliable: false});
  peer.onicecandidate = function(evt) {
      if (evt.candidate) {
          socketio.emit('icecandy',new RTCIceCandidate(evt.candidate));
      } else {
          console.log('onicecandidate with no candidate');
          console.log(evt);
      }
  };

//  peer.createOffer(function(desc) {
//console.log('offer');
//console.log(desc);
//    peer.setLocalDescription(desc);
//    socketio.emit('offer',desc);
//  }, error);

  //ストリームの準備ができたとき
  peer.onaddstream=function(stream){
console.log('onaddstream');
console.log(stream.stream);
//    var mediaStreamSource = context.createMediaStreamSource(stream.stream);
//    mediaStreamSource.connect(context.destination);
//audioelementを作ってそこにストリームを投げる場合は再生される
var audio_elem = document.createElement("audio");
audio_elem.src = URL.createObjectURL(stream.stream);
audio_elem.play();
  }
}, function(err){ //エラー処理
  console.log('getmedia error!!');
});

function sendOffer(){
  peer.createOffer(function(desc) {
console.log('offer');
console.log(desc);
    peer.setLocalDescription(desc);
    socketio.emit('offer',desc);
  }, error);
}

function offerReceived(offer) {
    peer.setRemoteDescription(new RTCSessionDescription(offer));
    peer.createAnswer(function(answer) {
console.log('createAns');
console.log(answer);
        peer.setLocalDescription(answer);
        socketio.emit('answer',answer);
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