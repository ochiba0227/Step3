$(loaded);
function loaded() {
  showList();
  // ボタンをクリックしたときに実行するイベントを設定する
  $('#cleateButton').click(
    // コールバックとしてメソッドを引数にわたす
    function() {
      saveList();
    });
  $('#sendButton').click(
    // コールバックとしてメソッドを引数にわたす
    function() {
//      $.post('voice', function(res){
//        console.log("removetodo_all:");
//      });
document.location = '/adjust';
    });
  $('#clearAllButton').click(function(){
    // 確認画面を表示
    if(confirm('全チャットルームを削除しますか？')==true){
      $.post('room', {remove: 'all'}, function(res){
        console.log("removetodo_all:"+res);
      });
      var message = $('#messageArea');
      message.css('color','#FE2E2E');
      message.text('全チャットルームを削除しました。');
      message.show();
      showList();
    }
  });
}

// フォームに入力された内容をDBに保存する
function saveList() {
  // 時刻をキーにして入力されたテキストを保存する
  var text = $('#listName');
  var message = $('#messageArea');
  //var val = escapeText(text.val());
  //if(checkText(val)){
  var val = text.val();
  if(val){
    // /todobaseにPOSTアクセスする
    $.post('/room', {name: val}, function(res){
      console.log(res);
    });
    // テキストボックスを空にする
    text.val('');
    message.css('color','#000');
    message.text('新しいToDoリストが作成されました。');
    message.show();
    // 再描画
    showList();
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
  var $list = $('#twocolumnList');
  $list.fadeOut(function(){
    $list.children().remove();
    // /roomにGETアクセスする
    $.get('room', function(rooms){
      // 取得したチャットルームを追加していく
      $.each(rooms, function(index, room){
        $list.append('<div class=\'sur\'><div class=\'cola\'>' + '<a href=\'#\' onClick=\"setID(\'' + room._id +'\')\"><b>' + room.name + ' 作成日:' + getDate(new Date(room.createdDate)) + ' 部屋ID:' + room._id + '</b></a><button class=\"editButton\" onClick=\"editName(\'' + room.name + '\',\''+ room._id +'\')\">e</button><br>' + '</div>' + '<div class=\'colb\'>' + '<button class=\"delButton\" onClick=\"removeRoom(\''+ room.name + '\',\'' + room._id +'\')\">X</button>' + '</div></div>');
      });
      // 一覧を表示する
      $list.fadeIn();
    });
  });
}

//クリックされた場合に呼び出すチャットルームをセットする
function setID(id){
  //呼び出すリストをローカルストレージlistIDに保存
  localStorage.setItem('roomID', id);
  //ページ遷移
  document.location = '/chatroom'; 
}

// todoリストの名前を編集
function editName(title,id){
  var newName=prompt('リスト：\"'+title+'\"の新しい名前を入力して下さい');
  if(newName!=null){
    // idに基づいてcontentnum,dueの更新
    $.post('/todobase', {id:id,title:newName}, function(res){
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

//ToDoリストのチェック状態を表示
function getToDo(todo){
  if(todo.contentsNum==0){
    return('ToDoはありません');
  }
  else{
    return(todo.contentsNum + '個中' + todo.checkedNum + '個がチェック済み<br>～' + getDate(new Date(todo.firstDue)));
  }
}

//チャットルームを削除する
function removeRoom(name,id){
  //確認画面を表示
  if(confirm(name+'を削除しますか？')==true){
    $.post('room', {remove: id}, function(res){
      console.log("removeroom:"+res);
    });
    var message = $('#messageArea');
    message.css('color','#FE2E2E');
    message.text(name+'を削除しました。');
    message.show();
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