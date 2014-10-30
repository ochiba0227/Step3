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
  userNameArea.text(myName);
}

function changeName(){
  alert('未実装です');
}