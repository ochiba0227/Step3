//getUserMedia()�̔ėp��
navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
window.URL = window.URL || window.webkitURL;
var peerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
window.RTCPeerConnection = peerConnection;

window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

//�[���̃r�f�I�A�����X�g���[�����擾
var context = new AudioContext();
var localMediaStream;

//�����[�g�̃��f�B�A�X�g���[��
var mediaStreamSource;

//���g�̃s�A���쐬
var peer = new peerConnection({iceServers: [{url: "stun:stun.l.google.com:19302"}]});
console.log(peer);

navigator.getMedia ({audio:true }, function(stream) {
  //���̓\�[�X�̍쐬(�}�C�N����̓���)
  //var mediaStreamSource = context.createMediaStreamSource(stream);
  //���g�̃X�s�[�J�[�ɐڑ�
  //mediaStreamSource.connect(context.destination);
//socketio.emit('voice',stream);
  //stream���O���[�o���ϐ���
  localMediaStream=stream;
  //���g�̃X�g���[����P2P�R�l�N�V�����ɒǉ�
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

  //�X�g���[���̏������ł����Ƃ�
  peer.onaddstream=function(stream){
console.log('onaddstream');
console.log(stream.stream);
//remotestream��connect���邱�Ƃ��ł��Ȃ���chrome�̃o�O
//    var mediaStreamSource = context.createMediaStreamSource(stream.stream);
//    mediaStreamSource.connect(context.destination);
//audioelement������Ă����ɃX�g���[���𓊂���ꍇ�͍Đ������
var audio_elem = document.createElement("audio");
audio_elem.src = URL.createObjectURL(stream.stream);
audio_elem.play();
  }
}, function(err){ //�G���[����
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