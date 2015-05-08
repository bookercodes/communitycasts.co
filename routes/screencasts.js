var express = require('express');

var router = express.Router();

router.get('/:screencastId', function (req ,res) {
  var query = 
  'SELECT screencastId \
   FROM screencasts \
   WHERE screencastId = ?';
  connection.queryAsync(query, req.params.screencastId).spread(function (screencasts) {
    if (screencasts.length === 0)
      // no screencast with this id exists, return 404 not found.
      return res.sendStatus(404);  
    res.redirect('https://www.youtube.com/watch?v=' + req.params.screencastId);
    // redirect the user as soon as possible, then record their view in the background.
    incrementViews(req.params.screencastId, req.connection.remoteAddress);
  }); 
});

function incrementViews(screencastId, refereeRemoteAddress) {
  var query = 
    'SELECT screencastId \
     FROM referrals \
     WHERE screencastId = ? AND refereeRemoteAddress = ?';
  connection.queryAsync(query, [screencastId, refereeRemoteAddress]).spread(function(referrals) {
    if (referrals.length !== 0) 
      // the user with this ip has seen the screencast before, do not count the view again.
      return;
    var query = 
      'UPDATE screencasts \
         SET referralCount = referralCount + 1 \
       WHERE screencastId = ?';
    connection.queryAsync(query, screencastId);
    connection.query('INSERT INTO referrals SET ?', { 
      screencastId: screencastId, 
      refereeRemoteAddress: refereeRemoteAddress
    });
  });
}

router.get('/tagged/other',function(req,res) { 
  res.render('technology', { tagName:'Other' });
});

router.get('/tagged/:technology', function (req, res) {
  res.render('technology', {tagName:req.params.technology});
});

module.exports = router;