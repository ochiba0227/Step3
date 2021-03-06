﻿var recLength = 0,
  recBuffersL = [],
  recBuffersR = [],
  sampleRate,
  noSoundBuffer;

this.onmessage = function(e){
  switch(e.data.command){
    case 'init':
      init(e.data.config);
      break;
    case 'record':
      record(e.data.buffer);
      break;
    case 'exportWAV':
      exportWAV(e.data.type);
      break;
    case 'getBuffer':
      getBuffer();
      break;
    case 'setBuffer':
      setBuffer(e.data.data);
      break;
    case 'clear':
      clear();
      break;
    case 'setNoSound':
      setNoSound();
      break;
  }
};

function init(config){
  sampleRate = config.sampleRate;
  //200ミリ秒の空白区間
  noSoundBuffer = new Float32Array(sampleRate/5);
}

function record(inputBuffer){
  recBuffersL.push(inputBuffer[0]);
  //recBuffersR.push(inputBuffer[1]);
  recLength += inputBuffer[0].length;
}

function exportWAV(type){
  var bufferL = mergeBuffers(recBuffersL, recLength);
  //var bufferR = mergeBuffers(recBuffersR, recLength);
  //var interleaved = interleave(bufferL, bufferR);
  //var dataview = encodeWAV(interleaved);
  var downsampledBuffer = downsampleBuffer(bufferL, 16000);
  var dataview = encodeWAV(downsampledBuffer,16000,true);
  var audioBlob = new Blob([dataview], { type: type });

  this.postMessage(audioBlob);
}

function setNoSound(){
  recBuffersL.push(noSoundBuffer);
  recLength += noSoundBuffer.length;
}

function getBuffer() {
  var buffers = [];
  buffers.push( mergeBuffers(recBuffersL, recLength) );
  //buffers.push( mergeBuffers(recBuffersR, recLength) );
  this.postMessage(buffers);
}

function setBuffer(data) {
  recBuffersL.push(data);
  recLength += data.length;
  this.postMessage('finish');
}

function clear(){
  recLength = 0;
  recBuffersL = [];
  recBuffersR = [];
}

function mergeBuffers(recBuffers, recLength){
  var result = new Float32Array(recLength);
  var offset = 0;
  for (var i = 0; i < recBuffers.length; i++){
    result.set(recBuffers[i], offset);
    offset += recBuffers[i].length;
  }
  return result;
}

function interleave(inputL, inputR){
  var length = inputL.length + inputR.length;
  var result = new Float32Array(length);

  var index = 0,
    inputIndex = 0;

  while (index < length){
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function floatTo16BitPCM(output, offset, input){
  for (var i = 0; i < input.length; i++, offset+=2){
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view, offset, string){
  for (var i = 0; i < string.length; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples,rate,isLittleEndian){
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * 2, isLittleEndian);
  /* RIFF type */
 writeString(view, 8, 'WAVE');
 /* format chunk identifier */
 writeString(view, 12, 'fmt ');
 /* format chunk length */
 view.setUint32(16, 16, isLittleEndian);
 /* sample format (raw) */
 view.setUint16(20, 1, isLittleEndian);
 /* channel count */
 //view.setUint16(22, 2, true); /*STEREO*/
 view.setUint16(22, 1, isLittleEndian); /*MONO*/
 /* sample rate */
 view.setUint32(24, rate, isLittleEndian);
 /* byte rate (sample rate * block align) */
 //view.setUint32(28, sampleRate * 4, true); /*STEREO*/
 view.setUint32(28, rate * 2, isLittleEndian); /*MONO*/
 /* block align (channel count * bytes per sample) */
 //view.setUint16(32, 4, true); /*STEREO*/
 view.setUint16(32, 2, isLittleEndian); /*MONO*/
 /* bits per sample */
 view.setUint16(34, 16, isLittleEndian);
 /* data chunk identifier */
 writeString(view, 36, 'data');
 /* data chunk length */
 view.setUint32(40, samples.length * 2, isLittleEndian);
 
  floatTo16BitPCM(view, 44, samples);

  return view;
}

//サンプリングレートを下げるやつ
function downsampleBuffer(buffer, rate) {
    if (rate == sampleRate) {
        return buffer;
    }
    if (rate > sampleRate) {
        throw "downsampling rate show be smaller than original sample rate";
    }
    var sampleRateRatio = sampleRate / rate;
    var newLength = Math.round(buffer.length / sampleRateRatio);
    var result = new Float32Array(newLength);
    var offsetResult = 0;
    var offsetBuffer = 0;
    while (offsetResult < result.length) {
        var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        var accum = 0, count = 0;
        for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }
        result[offsetResult] = accum / count;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result;
}