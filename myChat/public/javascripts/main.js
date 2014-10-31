$(loaded);

//新しいチャットルームを作るダイアログ
var newRoomModal;
//パスワードの比較を行うダイアログ
var passwordCompModal;
var passwordCompTitle;
//部屋名を変更するダイアログ
var roomRenameModal;
var roomName;
var roomRenameForm;
var newRoomName=null;
//リストを削除するダイアログ
var deleteListModal;
var delTitle=null;
var delFlag;

var text;
var pass;
var message;
var passMessage;
var passComp;

//ソート用
var sortBase;
var byRoomName;
var byUserName;
var byDate;

//入力パスワード
var inputPass;

function loaded() {
  text = $('#listName');
  pass = $('#listPass');
  message = $('#messageArea');

  //パスワードが誤っている場合のメッセージ
  passMessage = $('#passMessageArea');
  passMessage.css('color','#FE2E2E');
  passMessage.text('パスワードが誤っています．');

  passComp = $('#passComp');
  // ボタンをクリックしたときに実行するイベントを設定する
  $('#cleateButton').click(
    // コールバックとしてメソッドを引数にわたす
    function() {
      saveList();
    });
  $('#passwordCompButton').click(
    function() {
      inputPass = escapeText(passComp.val());
      passComp.val('');
      passwordCompModal.modal('hide');
    });
  $('#roomRenameButton').click(
    function() {
      newRoomName = escapeText(roomRenameForm.val());
      roomRenameForm.val('');
      roomRenameModal.modal('hide');
    });
  $('#deleteListModalButton').click(
    function() {
      delFlag=true;
      deleteListModal.modal('hide');
    });
  byRoomName=$('#byRoomName');
  byUserName=$('#byUserName');
  byDate=$('#byDate');
  //ソート用
  byRoomName.click(
    function() {
      //クリック後矢印が上向きになったら(昇順ソート)
      if(changeIcon($(this))){
        localStorage.setItem('sortBase', 'name');
        sortBase = 'name';
      }
      else{
        localStorage.setItem('sortBase', '-name');
        sortBase = '-name';
      }
      showList();
    });
  byUserName.click(
    function() {
      //クリック後矢印が上向きになったら(昇順ソート)
      if(changeIcon($(this))){
        localStorage.setItem('sortBase', 'createdBy');
        sortBase = 'createdBy';
      }
      else{
        localStorage.setItem('sortBase', '-createdBy');
        sortBase = '-createdBy';
      }
      showList();
    });
  byDate.click(
    function() {
      //クリック後矢印が上向きになったら(昇順ソート)
      if(changeIcon($(this))){
        localStorage.setItem('sortBase', 'createdDate');
        sortBase = 'createdDate';
      }
      else{
        localStorage.setItem('sortBase', '-createdDate');
        sortBase = '-createdDate';
      }
      showList();
    });

  //チャットルームの追加ボタンを追加
  var addRoom = $('#addRoom');
  newRoomModal = $('#newRoomModal');
  passwordCompModal = $('#passwordCompModal');
  passwordCompTitle = $('#passwordCompTitle');
  roomRenameModal = $('#roomRenameModal');
  roomRenameForm = $('#roomRenameForm');
  roomName = $('#roomName');
  deleteListModal = $('#deleteListModal');
  delTitle = $('#delTitle');
  addRoom.text('新しいチャットルームを作成');
  addRoom.on('click', function(){
    newRoomModal.modal('show');
  });

  // ソート順が変更されている場合
  sortBase = localStorage['sortBase'];
  //ソート順が変更されてなければ日付新しい順
  if(!sortBase){
    sortBase = '-createdDate';
  }
  //ソート状況に応じたアイコンとリストを表示
  setSortIcon();
  showList();
}

function setSortIcon(){
  switch (sortBase){
    case '-name':
      changeIcon(byRoomName);
      break;
    case '-createdBy':
      changeIcon(byUserName);
      break;
    case '-createdDate':
      changeIcon(byDate);
      break;
  }
}

//矢印の上下を変更
function changeIcon(clickedObj){
  clickedObj.toggleClass('glyphicon-arrow-up');
  clickedObj.toggleClass('glyphicon-arrow-down');
  if(clickedObj.hasClass('glyphicon-arrow-up')){
    return(true);
  }
  else{
    return(false);
  }
}

// フォームに入力された内容をDBに保存する
function saveList() {
  // 時刻をキーにして入力されたテキストを保存する
  var val = escapeText(text.val());
  var valPass = escapeText(pass.val());
  //if(checkText(val)){
  if(val){
    // /todobaseにPOSTアクセスする
    $.post('/room', {name: val,pass:valPass,userName:myName}, function(res){
//      console.log(res);
    });
    // テキストボックスを空にする
    text.val('');
    pass.val('');
    newRoomModal.modal('hide');
   // 再描画
    showList();
    message.hide();
  }
  else{//エラーがあった場合
    message.css('color','#FE2E2E');
    message.text('入力にエラーがありました。');
    message.show();
  }
}

// ToDoBaseの一覧を取得して表示する　デフォルトは日付降順
function showList() {
  // すでにある要素を削除する
  var $list = $('#roomList');
  $list.fadeOut(function(){
    // /roomにGETアクセスする
    $.get('room',{sortBy:sortBase}, function(rooms){
      var child = $list.children()[1];
      if(child){
        //子要素(tbody)があれば再帰的に削除
        child.remove();
      }
      // 取得したチャットルームを追加していく
      $list.append('<tbody>');
      $.each(rooms, function(index, room){
        if(room.hasPassword){
          $list.append('<tr>' + '<td><span class=\'glyphicon glyphicon-lock\'></span></td><td><a href=\'#\' onClick=\"checkPassword(\'' + room._id + '\',\'' + 'setID' +'\')\"><b>' + room.name + '</td>' + '<td>' + room.createdBy + '</td>' + '<td>' + getDate(new Date(room.createdDate)) + '</td>' + '<td><div class="btn-group"><button class=\"btn btn-warning\" onClick=\"checkPassword(\'' + room._id + '\',\'' + 'editName' +'\')\">EditNAME</button>' + '<button class=\"btn btn-danger\" onClick=\"checkPassword(\'' + room._id + '\',\'' + 'removeRoom' +'\')\">DeleteRoom</button></div></td>' + '</tr>');
        }
        else{
          $list.append('<tr>' + '<td></td><td><a href=\'#\' onClick=\"checkPassword(\'' + room._id + '\',\'' + 'setID' +'\')\"><b>' + room.name + '</td>' + '<td>' + room.createdBy + '</td>' + '<td>' + getDate(new Date(room.createdDate)) + '</td>' + '<td><div class="btn-group"><button class=\"btn btn-warning\" onClick=\"checkPassword(\'' + room._id + '\',\'' + 'editName' +'\')\">EditNAME</button>' + '<button class=\"btn btn-danger\" onClick=\"checkPassword(\'' + room._id + '\',\'' + 'removeRoom' +'\')\">DeleteRoom</button></div></td>' + '</tr>');
        }
      });
      $list.append('</tbody>');
      // 一覧を表示する
      $list.fadeIn();
    });
  });
}
//パスワードの確認
function confirmPassword(id,inputPass){
  var result=false;
  $.ajax({
    async: false,
    type: 'GET',
    url: 'room',
    data:{
      compPassID:id,
      inputPass:inputPass
    },
    success: function(val) {
      //パスワードが正しければtrue
      if(val){
          result = true;
      }
      else{
        result = false;
      }
    }
  });
  return result;
}

//パスワード付きページか確認，パスワードが無い，正しいパスワードが入力されたらtrue,パスワード間違えたらfalse
function checkPassword(id,funcName){
  $.ajax({
    async: false,
    type: 'GET',
    url: 'room',
    data:{
      getPassID:id
    },
    success: function(val) {
      //パスワードがあった
      if(val.pass){
        setMessage(passMessage,false);
        passwordCompTitle.text(val.name+'のパスワードを入力してください．');
        passwordCompModal.modal('show');
        passwordCompModal.on('hidden.bs.modal', function (e) {
          //文字列が入力された
          if(inputPass!=null){
            if(confirmPassword(id,inputPass)==true){
              if(funcName.search('setID')!=-1&&funcName.length==5){
                setID(val.name,id);
              }
              else if(funcName.search('removeRoom')!=-1&&funcName.length==10){
                removeRoom(val.name,id);
              }
              else if(funcName.search('editName')!=-1&&funcName.length==8){
                editName(val.name,id);
              }
            }
            else{
              inputPass = null;
              setMessage(passMessage,true);
              passwordCompModal.modal('show');
            }
          }
          //キャンセルされた
          inputPass = null;
        });        
      }
      else{
        //パスワードが無かった
        if(funcName.search('setID')!=-1&&funcName.length==5){
          setID(val.name,id);
        }
        else if(funcName.search('removeRoom')!=-1&&funcName.length==10){
          removeRoom(val.name,id);
        }
        else if(funcName.search('editName')!=-1&&funcName.length==8){
          editName(val.name,id);
        }
      }
    }
  });
}

//クリックされた場合に呼び出すチャットルームをセットする
function setID(name,id){
  //呼び出すリストをローカルストレージlistIDに保存
  localStorage.setItem('roomID', id);
  localStorage.setItem('roomName', name);
  //ページ遷移
  document.location = '/chatroom'; 
}

function setMessage(message,toFlag){
  if (message.css('display') == 'block') {
    //表示されているときに非表示にしたい
    if(!toFlag){
      message.hide();
    }
  } else {
    //非表示のときに表示したい
    if(toFlag){
      message.show();
    }
  }
}

// チャットルームの名前を編集
function editName(name,id){
  roomName.text(name+'の名前を変更');
  roomRenameModal.modal('show');
  roomRenameModal.on('hidden.bs.modal', function (e) {
    if(newRoomName!=null&&newRoomName.length>0&&newRoomName!==name){
      // idに基づいてcontentnum,dueの更新
      $.post('room', {id:id,name:newRoomName}).done(function(res){
        console.log('changetodobase_withname:'+res);
        showList();
      });
    }
  });
}

//チャットルームを削除する
function removeRoom(name,id){
  //確認画面を表示
  delTitle.text(name+'を削除しますか？');
  deleteListModal.modal('show');
  delFlag = false;
  deleteListModal.on('hidden.bs.modal', function (e) {
    if(delFlag){
      $.post('room', {remove: id}, function(res){
        console.log("removeroom:"+res);
      });
      showList();
    }
  });
}

//日付データの整形
function getDate(date){
  return(date.getFullYear() + '年' + (date.getMonth()+1) + '月' + date.getDate() + '日');
}

// ドロップダウンに基づいてソート
function sortby(obj){
  var val = obj.options[obj.selectedIndex].value;
  // ソート結果を描画
  showList(val);
  // ソート状態をローカルストレージsortBaseに保存
  localStorage.setItem('sortBase', val);
}