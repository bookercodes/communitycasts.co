var express = require('express');

var router = express.Router();

router.get('/:videoId', function (req ,res) {
  var id = connection.escape(req.params.videoId);
  connection.query('SELECT screencastId FROM screencasts WHERE screencastId = ' + id, function (err, result) {
    if (err) {
        console.log(err);
      }
    var video = result[0];
    // if the query results in an empty video record, the video could not
    // be found, so return a 404.
    if(!video) {
      res.sendStatus(404);
      return;
    }
    // redirect the user as soon as possible.
    res.redirect('https://www.youtube.com/watch?v=' + video.screencastId);
    // but keep processing..
    // todo: 1??
    var query = 
      'SELECT 0 \
       FROM referrals \
       WHERE screencastId = '+ id + ' AND refereeRemoteAddress = ' + connection.escape(req.connection.remoteAddress);
    connection.query(query, function(err, result) {
      if (err) {
        console.log(err);
      }
      // if a record who meets the condition cannot be found, the 
      // user with this ip has not been referred to this video before, 
      // so increment the refferal count.
      var referral = result[0]
      if (!referral) {
        var query = 
          'UPDATE screencasts \
             SET referralCount = referralCount + 1 \
           WHERE screencastId = ' + id;
        connection.query(query);
        connection.query('INSERT INTO referrals SET ?', { 
          screencastId: req.params.videoId, 
          refereeRemoteAddress: req.connection.remoteAddress
        });
      }
    });
  }); 
});

module.exports = router;