var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('help', { title: '相談するとこ~Help~' });
});

module.exports = router;
