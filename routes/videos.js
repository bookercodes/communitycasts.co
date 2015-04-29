var express = require('express');
var router = express.Router();

router.get('/:videoId', function (req ,res) {
  var id = connection.escape(req.params.videoId);
  connection.query('select videoId from videos where videoId = ' + id, function (err, result) {
    var video = result[0];
    if(!video) {
      res.sendStatus(404);
      return;
    }
    res.redirect('https://www.youtube.com/watch?v=' + video.videoId);
    var query = 'select 1 \
      from referrals \
      where videoId = '+ id + ' and refereeIp = ' + connection.escape(req.connection.remoteAddress);
    connection.query(query, function(err, result) {
      var referral = result[0]
      if (!referral) {
        connection.query(
          'update videos \
             set referrals = referrals + 1 \
           where videoId = ' + id);
        connection.query('insert into referrals set ?', { 
          videoId: req.params.videoId, 
          refereeIp: req.connection.remoteAddress
        });
      }
    });
  }); 
});

module.exports = router;