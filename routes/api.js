var express = require('express');
var moment  = require('moment');

var router  = express.Router();

router.get('/', function(req,res) {
  var model = {};
  connection.query('select count(*) as total from videos', function(err, result) {
    model.total = result[0].total;
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
      group by v.videoId \
      limit ' + req.query.offset + ', ' + req.query.limit
    connection.query(query, function (err, videos) {
      videos.forEach(function(video) {
        video.technologies = video.technologies.split(',');
        video.duration = moment.duration(video.durationInSeconds, 'seconds').humanize();
        delete video.durationInSeconds;
      });
      model.rows = videos;
      res.send(model);
    });
  });
});

module.exports = router;