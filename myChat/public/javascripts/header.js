$(init);

//ユーザの名前
var myName;
//ユーザ名を表示するエリア
var userNameArea;

var newUserName;

var userRenameModal;
var userRenameForm;
var userRenameFlag;
var userRenameMessageArea;

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
      userRenameFlag=true;
      newUserName = userRenameForm.val();
      userRenameForm.val('');
      userRenameModal.modal('hide');
    });
  //入力が誤っている場合のメッセージ
  userRenameMessageArea = $('#userRenameMessageArea');
  userRenameMessageArea.css('color','#FE2E2E');
  userRenameMessageArea.text('1文字以上で入力してください.');
}

function changeName(){
  userRenameFlag=false;
  userRenameModal.modal('show');
  userRenameMessageArea.hide();
  userRenameModal.on('hidden.bs.modal', function (e) {
    if(userRenameFlag&&newUserName!=null&&newUserName!==myName){
      newUserName=escapeText(newUserName);
      if(newUserName.length<1){
        userRenameFlag=false;
        userRenameMessageArea.show();
        userRenameModal.modal('show');
        return;
      }
      localStorage.setItem('myName', newUserName);
      myName = newUserName;
      userNameArea.text('UserName:'+myName);
      alert('変更が完了しました');
    }
  });
}