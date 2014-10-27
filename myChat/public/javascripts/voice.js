//getUserMedia()�̔ėp��
navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
window.URL = window.URL || window.webkitURL;
var peerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
window.RTCPeerConnection = peerConnection;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

// �����F���p
var recogID;
var recogSocket = io.connect('https://aocserver.dip.jp:3000');
//�����F���T�[�o�ɐڑ�����
recogSocket.on('connected', function(data) {
  recogID=data;
  console.log('connected to recogserver');
});
recogSocket.on('return', function(data) {
  console.log(data);
  publishMessage(data);
});

//�^���p
var audioContext;
var recorder;

//�m�C�Y�΍�̃��[�p�X�t�B���^�̍쐬
var lowpassFilter;

//���g�̃X�g���[���D������Firefox�͎~�܂�
var localMediaStream;

//�s�A���쐬
var peer = new Array();

//�����[�U�̉���
var audio_elem = new Array();

//�[���̃r�f�I�A�����X�g���[�����擾
navigator.getMedia ({audio:true }, function(stream) {
  //stream���O���[�o���ϐ���
  localMediaStream=stream;

  //�^���p�ݒ�
  audioContext = new AudioContext();
  var input = audioContext.createMediaStreamSource(stream);
  lowpassFilter = audioContext.createBiquadFilter();
  lowpassFilter.type = 0;
  lowpassFilter.frequency.value = 20000;
  input.connect(lowpassFilter);
  recorder = new Recorder(lowpassFilter, { workerPath: 'javascripts/recorderWorker.js' });
  //�F���J�n
  captureStart();
}, function(err){ //�G���[����
  console.log('getmedia error!!');
});

//�����F���J�n
function captureStart(){
    recorder && recorder.record();
    setTimeout('captureStop()', 10000);
}

//10�b���؂�
function captureStop(){
    recorder && recorder.stop();
    recorder && recorder.exportWAV(wavExported);
}

//wavblob�̐��������R�[���o�b�N
function wavExported(blob) {
    upload(blob);
    recorder.clear();
    //���̉����F��
    captureStart();
}

//�F���T�[�o��wav�t�@�C�����A�b�v���[�h����
function upload(file){
  var fileReader = new FileReader();
  var send_file = file;

  var data = {};
  var date = new Date();
  fileReader.readAsBinaryString(send_file);
  fileReader.onload = function(event) {
    data.file = event.target.result;
    data.name = recogID + date.getMinutes() + date.getSeconds();
console.log("upupupu");
    recogSocket.emit('upload',data);
  }
}

//�e�s�A�ɐڑ��v���𓊂���悤�v��
function callMe(){
  socketio.emit('callme',{ room: currentRoom });
}

//�ڑ��v���𓊂���
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
  }, function(){
    //�X�g���[���������ꍇ(��M�݂̂��s���ꍇ)
    console.log('receive only');
    socketio.emit('callme',{ room: currentRoom });
  });
}

//�ڑ��v������M������Ԏ�����
function offerReceived(offer) {
console.log('offerrec');
console.log(offer.id);
  //�s�A�̐ݒ�
  setPeerData(offer.id);

  //offer.id�������s�A��offer.desk��ݒ�
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

//�ڑ��v���ɑ΂��ē������Ԃ��Ă����瑊��̃X�g���[�����s�A�ɃZ�b�g
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
  // �s�A�̍쐬�@��x�����I
  if(peer[id]==null){
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
  else{
     console.log('peer is already created');
  }
}