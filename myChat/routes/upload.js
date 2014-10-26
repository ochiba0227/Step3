var fs;

fs = require('fs');

exports.post = function(req, res) {
  var target_path, tmp_path;
  tmp_path = req.body.fname;
  target_path = './uploads/' + tmp_path;
console.log('blob:'+req.body.buf);
console.log('nanana:'+req.body.nanana);
console.log('tmp_path:'+tmp_path);
console.log('target_path:'+target_path);
fs.writeFile('writetest.txt', req.body.fname , function (err) {
    if (err) throw err;
    console.log(err);
});
//  fs.rename(tmp_path, target_path, function(err) {
//    if (err) {
//      throw err;
//    }
//    fs.unlink(tmp_path, function() {
//      if (err) {
//        throw err;
//      }
//      res.send('File uploaded to: ' + target_path + ' - ' + tmp_path + ' bytes');
//    });
//  });
};