// mongooseを用いてMongoDBに接続する
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/morishita_step3db');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var adjust = require('./routes/adjust');
var room = require('./routes/chatroom');

// チャットルームのスキーマを定義する
var Schema = mongoose.Schema;
var roomSchema = new Schema({
  name       : String,// 部屋の名前
  createdDate : {type: Date, default: Date.now}// 作成日時
});
mongoose.model('room', roomSchema);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('transports', ['websocket', 'xhr-polling', 'jsonp-polling', 'htmlfile', 'flashsocket']);
app.set('polling duration', 10);
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/adjust', adjust);
app.use('/chatroom', room);

// /roomにGETアクセスしたとき、チャットルームを取得・検索するAPI
app.get('/room', function(req, res) {
  var roomBase = mongoose.model('room');
  // urlからqueryを抽出
  var query = require('url').parse(req.url,true).query;
  var id=query.id;

  // idパラメータがあればそのIDのリストを返す
  if(id){
    roomBase.findById(id).exec(function(err, todo) {
      res.send(todo);
    });
  }
  //なければ全部
  else{
    roomBase.find({}).exec(function(err, todos) {
      res.send(todos);
    });
  }
});

// /roomにPOSTアクセスしたとき、チャットルームを追加・変更・削除するAPI
app.post('/room', function(req, res) {
  var name = req.body.name;
  var remove = req.body.remove;
  var id = req.body.id;
  // removeパラメータがあれば当該IDを削除 allが与えられていれば全削除
  if(remove) {
    var roomBase = mongoose.model('room');
    //全削除パターン
    if(remove=='all'){
      roomBase.remove().exec();
    }
    //単一IDの削除
    else{
      roomBase.findByIdAndRemove(remove).exec();
    }
    res.send(true);
  }
  // 未実装！！！！！！！！！！！！！！！！！！！idパラメータがあれば当該IDのリストを変更
  else if(id){
    var todoBase = mongoose.model('room');
    var firstDue = req.body.limit;
    var contentsNum = req.body.contentsNum;
    var checkedNum = req.body.checkedNum;
    todoBase.findById(id).exec(function(err, todo) {
      //タイトルの更新
      if(title){
        todo.title=title;
      }
      //直近の期限の更新
      if(firstDue){
        todo.firstDue=firstDue;
      }
      //todoリスト数の更新
      if(contentsNum&&contentsNum>=0){
        todo.contentsNum=contentsNum;
      }
      //チェックされたtodoリスト数の更新
      if(checkedNum&&checkedNum>=0){
        todo.checkedNum=checkedNum;
      }
      todo.save(function(){
        res.send(true);
      });
    });
  }
  // ToDoBaseの名前のパラメータがあればMongoDBに保存
  else if(name) {
    var roomDB = mongoose.model('room');
    var newRoom = new roomDB();
    newRoom.name = name;
    newRoom.save();
    res.send(true);
  } else {
    res.send(false);
  }
});

// エラーハンドラは下に持っていく
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
