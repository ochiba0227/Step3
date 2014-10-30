$(init);

//ユーザの名前
var myName;
//ユーザ名を表示するエリア
var userNameArea;

var newUserName;

var userRenameModal;
var userRenameForm;

function init(){
  myName = localStorage['myName'];
  if(!myName){
    myName = '名無し' + Math.floor(Math.random()*10000) + '号';
    localStorage.setItem('myName', myName);
  }
  userNameArea=$('#userName');
  userNameArea.text('UserName:'+myName);

  userRenameModal = $('#userRenameModal');
  userRenameForm = $('#userRenameForm');

  $('#userRenameButton').click(
    function() {
      newUserName = userRenameForm.val();
      userRenameForm.val('');
      userRenameModal.modal('hide');
    });
}

function changeName(){
  userRenameModal.modal('show');
  userRenameModal.on('hidden.bs.modal', function (e) {
    if(newUserName!=null&&newUserName!==myName){
      localStorage.setItem('myName', newUserName);
      myName = newUserName;
      userNameArea.text('UserName:'+myName);
      alert('変更が完了しました');
    }
  });
}