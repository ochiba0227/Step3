//getUserMedia()�̔ėp��
navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
window.URL = window.URL || window.webkitURL;
//�[���̃r�f�I�A�����X�g���[�����擾
var context = new AudioContext();
//�m�C�Y�΍􃍁[�p�X�t�B���^
var lowpassFilter = context.createBiquadFilter();
lowpassFilter.type = 0;
lowpassFilter.frequency.value = 440;

var audioAnalyser = context.createAnalyser();
var audioAnalyzedData = new Float32Array(audioAnalyser.frequencyBinCount);

navigator.getMedia ({audio:true }, function(stream) {
  //���̓\�[�X�̍쐬(�}�C�N����̓���)
  var mediaStreamSource = context.createMediaStreamSource(stream);
  //�A�i���C�U�Ǝ��g�̃X�s�[�J�[�ɐڑ�
  mediaStreamSource.connect(audioAnalyser);
//  mediaStreamSource.connect(context.destination);

  setInterval(function(){
    audioAnalyser.getFloatFrequencyData(audioAnalyzedData);
    //socketio.emit('voice', audioAnalyzedData);
    //socketio.emit('voice', mediaStreamSource);
    //console.log(mediaStreamSource);
    //console.log(audioAnalyzedData);
  },100);
}, function(err){ //�G���[����
  console.log('getmedia error!!');
});

function playSound(data){
  console.log('data:');
  console.log(data);
}