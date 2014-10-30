$(loaded);

//新しいチャットルームを作るダイアログ
var newRoomModal;
//パスワードの比較を行うダイアログ
var passwordCompModal;
var passwordCompTitle;

var text;
var pass;
var message;
var passMessage;
var passComp;

//入力パスワード
var inputPass;

function loaded() {
  showList();
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
    // コールバックとしてメソッドを引数にわたす
    function() {
      inputPass = passComp.val();
      passComp.val('');
      passwordCompModal.modal('hide');
    });
  //チャットルームの追加ボタンを追加
  var addRoom = $('#addRoom');
  newRoomModal = $('#newRoomModal');
  passwordCompModal = $('#passwordCompModal');
  passwordCompTitle = $('#passwordCompTitle');
  addRoom.text('新しいチャットルームを作成');
  addRoom.on('click', function(){
    newRoomModal.modal('show');
  });
}

// フォームに入力された内容をDBに保存する
function saveList() {
  // 時刻をキーにして入力されたテキストを保存する
  //var val = escapeText(text.val());
  //if(checkText(val)){
  var val = text.val();
  if(val){
    // /todobaseにPOSTアクセスする
    $.post('/room', {name: val,pass:pass.val(),userName:myName}, function(res){
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
  var child = $list.children()[1];
    if(child){
      //子要素(tbody)があれば削除
      child.remove();
    }
    // /roomにGETアクセスする
    $.get('room', function(rooms){
      // 取得したチャットルームを追加していく
      $list.append('<tbody>');
      $.each(rooms, function(index, room){
        $list.append('<tr>' + '<td><a href=\'#\' onClick=\"checkPassword(\'' + room._id +'\')\"><b>' + room.name + '</td>' + '<td>' + room.createdBy + '</td>' + '<td>' + getDate(new Date(room.createdDate)) + '</td>' + '<td><div class="btn-group"><button class=\"btn btn-warning\" onClick=\"editName(\'' + room.name + '\',\''+ room._id +'\')\">EditNAME</button>' + '<button class=\"btn btn-danger\" onClick=\"removeRoom(\''+ room.name + '\',\'' + room._id +'\')\">DeleteRoom</button></div></td>' + '</tr>');
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
function checkPassword(id){
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
              setID(id);
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
        setID(id);
      }
    }
  });
}

//クリックされた場合に呼び出すチャットルームをセットする
function setID(id){
  //呼び出すリストをローカルストレージlistIDに保存
  localStorage.setItem('roomID', id);
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
function editName(title,id){
  var newName=prompt('部屋：\"'+title+'\"の新しい名前を入力して下さい');
  if(newName!=null){
    // idに基づいてcontentnum,dueの更新
    $.post('/room', {id:id,title:newName}, function(res){
      console.log('changetodobase_withname:'+res);
    });
    // ソート順が変更されている場合
    var sortBase = localStorage['sortBase'];
    if(sortBase){
      showList(sortBase);
    }
    else{
      showList();
    }
  }
}

//チャットルームを削除する
function removeRoom(name,id){
  //確認画面を表示
  if(confirm(name+'を削除しますか？')==true){
    $.post('room', {remove: id}, function(res){
      console.log("removeroom:"+res);
    });
//   message.css('color','#FE2E2E');
//    message.text(name+'を削除しました。');
//    message.show();
    showList();
  }
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