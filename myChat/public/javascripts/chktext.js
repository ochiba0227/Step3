//htmlタグのエスケープ
function escapeText(text) {
  return $('<div>').text(text).html();
}

//文字列長のチェック
function checkTextLength(text){
  // 文字数が0または30以上は不可
  if (0 === text.length || 30 < text.length) {
    alert('文字数は1～30字にしてください');
    return false;
  }
  return true;
}

//文字列の内容のチェック
function checkTextContents(text){
  var flag=true;
  // すでに入力された値があればfalse
  // /todobaseに同期処理でGETアクセスする
  $.ajax({
    async: false,
    type: 'GET',
    url: 'room',
    success: function(rooms) {
      // 既存のToDoのtitleと新しく追加するtitleを比較
      $.each(todos, function(index, todo){
        // 内容が一致するものがあるか比較
        if (text === todo.title) {
          flag=false;
          alert('同じ内容は避けてください');
          return false;
        }
      });
    }
  });
  return flag;
}

// 入力チェックを行う
function checkText(text) {
  if(checkTextLength(text)==false){
    return false;
  }
  if(checkTextContents(text)==false){
    return false;
  }
  // すべてのチェックを通過できれば可
  return true;
}