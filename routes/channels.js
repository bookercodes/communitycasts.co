var express = require('express');

var router  = express.Router();

router.get('/', function(req, res) {
  connection.query('select * from channels', function (err, channels) {
    res.render('channels', { channels: channels });
  });
});

router.get('/:channelId', function(req, res) {
  res.redirect('https://www.youtube.com/channel/' + req.params.channelId);
});

module.exports = router;