$(init);

//ユーザの名前
var myName;
//ユーザ名を表示するエリア
var userNameArea;

function init(){
  myName = localStorage['myName'];
  if(!myName){
    myName = '名無し' + Math.floor(Math.random()*10000) + '号';
    localStorage.setItem('myName', myName);
  }
  userNameArea=$('#userName');
  userNameArea.text('UserName:'+myName);
}

function changeName(){
  var newName = prompt('未実装ですが，ユーザ名の変更が可能です．',myName);
  if(newName!=null&&newName!==myName){
    localStorage.setItem('myName', newName);
    myName = newName;
    userNameArea.text('UserName:'+myName);
    alert('変更が完了しました');
  }
}