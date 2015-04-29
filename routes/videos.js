var express = require('express');

var router = express.Router();

router.get('/:videoId', function (req ,res) {
  var id = connection.escape(req.params.videoId);
  connection.query('select videoId from videos where videoId = ' + id, function (err, result) {
    var video = result[0];
    // if the query results in an empty video record, the video could not
    // be found, so return a 404.
    if(!video) {
      res.sendStatus(404);
      return;
    }
    // redirect the user as soon as possible.
    res.redirect('https://www.youtube.com/watch?v=' + video.videoId);
    // but keep processing..
    var query = 
      'select 1 \
       from referrals \
       where videoId = '+ id + ' and refereeIp = ' + connection.escape(req.connection.remoteAddress);
    connection.query(query, function(err, result) {
      // if a record who meets the condition cannot be found, the 
      // user with this ip has not been referred to this video before, 
      // so increment the refferal count.
      var referral = result[0]
      if (!referral) {
        var query = 
          'update videos \
             set referrals = referrals + 1 \
           where videoId = ' + id;
        connection.query(query);
        connection.query('insert into referrals set ?', { 
          videoId: req.params.videoId, 
          refereeIp: req.connection.remoteAddress
        });
      }
    });
  }); 
});

module.exports = router;