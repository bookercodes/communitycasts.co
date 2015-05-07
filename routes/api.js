var express = require('express');
var common  = require('../common');

var router  = express.Router();

router.get('/screencasts', function(req,res) {
  var body = {};
  connection.query('SELECT COUNT(*) AS total FROM screencasts', function(err, result) {
    body.total = result[0].total;
    var query = 
      'SELECT \
         v.screencastId, \
         v.title, \
         c.channelId, \
         c.channelName, \
         v.durationInSeconds, \
         v.submissionDate, \
         GROUP_CONCAT(m.tagName) as tags \
      FROM screencasts v \
      JOIN channels c \
        ON c.channelId = v.channelId \
      JOIN screencastTags m \
        ON m.screencastId = v.screencastId \
      WHERE v.approved = 1 \
      GROUP by v.screencastId';

    if (req.query.sort === 'popular')
      query += ' ORDER BY v.referralCount DESC';
    else
      query += ' ORDER BY v.submissionDate DESC';

    // pagination
    query += ' LIMIT ' + parseInt(req.query.offset) + ', ' + parseInt(req.query.limit);

    connection.query(query, function (err, videos) {
      common.convertRecordsToLocals(videos);
      body.rows = videos;
      res.send(body);
    });
  });
});

router.get('/technologies',function(req,res) { 
  connection.query('SELECT tagName FROM tags', function(err, result) {
    res.send(result);
  });
});

module.exports = router;