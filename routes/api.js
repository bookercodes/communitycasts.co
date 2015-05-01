var express = require('express');
var common  = require('../common');

var router  = express.Router();

router.get('/screencasts', function(req,res) {
  var body = {};
  connection.query('select count(*) as total from videos', function(err, result) {
    body.total = result[0].total;
    var query = 
      'select \
         v.videoId, \
         v.title, \
         c.channelId, \
         c.channelName, \
         v.durationInSeconds, \
         v.submissionDate, \
         GROUP_CONCAT(m.technologyName) as technologies \
      from videos v \
      join channels c \
        on c.channelId = v.channelId \
      join technology_video_map m \
        on m.videoId = v.videoId \
      where v.approved = 1 \
      group by v.videoId';

    if (req.query.kind === 'popular')
      query += ' order by v.referrals desc';
    else
      query += ' order by v.submissionDate desc';

    // pagination
    query += ' limit ' + parseInt(req.query.offset) + ', ' + parseInt(req.query.limit);

    connection.query(query, function (err, videos) {
      common.convertRecordsToLocals(videos);
      body.rows = videos;
      res.send(body);
    });
  });
});

router.get('/technologies',function(req,res) { 
  connection.query('select technologyName from technologies', function(err, result) {
    res.send(result);
  });
});

module.exports = router;