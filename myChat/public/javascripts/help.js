function certActive(){
  var children = $('#myTab').children();
  for(var i=0; i<children.length;i++){
   if($(children[i]).hasClass('active')){
     $(children[i]).removeClass('active');
   }
  }
  $('#certli').addClass('active');
}