var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('chatroom', { title: '相談するとこ' });
});

module.exports = router;
