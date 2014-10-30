var recLength = 0,
  recBuffersL = [],
  sec;

this.onmessage = function(e){
  switch(e.data.command){
    case 'init':
      init(e.data.config);
      break;
    case 'record':
      record(e.data.buffer);
      break;
    case 'getBuffer':
      getBuffer();
      break;
    case 'clear':
      clear();
      break;
  }
};

function init(config){
  //200ミリ秒
  sec = config.sampleRate/5;
}

function record(inputBuffer){
  recBuffersL.push(inputBuffer[0]);
  recLength += inputBuffer[0].length;
  while(recLength > sec){
    recBuffersL.shift();
    recLength--;
  }
}

function getBuffer() {
  var buffers = [];
  buffers.push( mergeBuffers(recBuffersL, recLength) );
  this.postMessage(buffers);
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

function clear(){
  recLength = 0;
  recBuffersL = [];
}