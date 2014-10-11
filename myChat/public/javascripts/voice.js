//getUserMedia()�̔ėp��
navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
window.URL = window.URL || window.webkitURL;
var peerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
window.RTCPeerConnection = peerConnection;

window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

//�[���̃r�f�I�A�����X�g���[�����擾
//var context = new AudioContext();
var localMediaStream;

//�s�A���쐬
var peer = new Array();

//�����[�U�̉���
var audio_elem = new Array();

navigator.getMedia ({audio:true }, function(stream) {
  //stream���O���[�o���ϐ���
  localMediaStream=stream;
}, function(err){ //�G���[����
  console.log('getmedia error!!');
});

function callMe(){
  socketio.emit('callme',{ room: currentRoom });
}

function sendOffer(id){
  //�s�A�̐ݒ�
  setPeerData(id);

  peer[id].createOffer(function(desc) {
console.log('offer');
console.log(desc);
console.log(id);
console.log(peer);
    peer[id].setLocalDescription(desc);
    socketio.emit('offer',{ room: currentRoom, desc: desc, id:id });
  }, function(){console.log('error:createOffer');});
}

function offerReceived(offer) {
console.log('offerrec');
console.log(offer.id);
  //�s�A�̐ݒ�
  setPeerData(offer.id);

  //offer.id�������s�A��offer.desk��ݒ�
  peer[offer.id].setRemoteDescription(new RTCSessionDescription(offer.desc));

  peer[offer.id].createAnswer(function(answer) {
console.log('createAns');
console.log(answer);
      peer[offer.id].setLocalDescription(answer);
      socketio.emit('answer',{ room: currentRoom, answer: answer, id:offer.id });
  }, function(){console.log('error:createAns');});
}
 
function answerReceived(answer) {
console.log('ansrcv');
console.log(answer.id);
console.log(new RTCSessionDescription(answer.desc));
  peer[answer.id].setRemoteDescription(new RTCSessionDescription(answer.desc));
console.log(peer[answer.id]);
}

function iceCandidateReceived(message) {
  // �I�u�W�F�N�g��icecandidate�^�ɕϊ�
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
  // �s�A�̍쐬
  peer[id] = new peerConnection({iceServers: [{url: "stun:stun.l.google.com:19302"}]});
  //���g�̃X�g���[����P2P�R�l�N�V�����ɒǉ�
  if(localMediaStream!=null){
    peer[id].addStream(localMediaStream);
  }
  //���g�̃X�g���[���̑��M
  peer[id].onicecandidate = function(evt) {
      if (evt.candidate) {
          socketio.emit('icecandy',{ room: currentRoom, icecandy: new RTCIceCandidate(evt.candidate), id:id});
      } else {
          console.log('onicecandidate with no candidate');
          console.log(evt);
      }
  }

  //�����[�U�̃X�g���[���̏������ł����Ƃ�
  peer[id].onaddstream=function(stream){
console.log('onaddstream');
console.log(stream.stream);
//remotestream��connect���邱�Ƃ��ł��Ȃ���chrome�̃o�O
//    var mediaStreamSource = context.createMediaStreamSource(stream.stream);
//    mediaStreamSource.connect(context.destination);
//audioelement������Ă����ɃX�g���[���𓊂���ꍇ�͍Đ������
    audio_elem[id] = document.createElement("audio");
    audio_elem[id].src = URL.createObjectURL(stream.stream);
    audio_elem[id].play();
console.log(audio_elem);
  }
}