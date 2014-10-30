var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('adjust', { title: '相談するとこ~マイク音量の調節~' });
});

module.exports = router;
