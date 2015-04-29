var express = require('express');
var router  = express.Router();
var moment  = require('moment');

var convertRecordsToLocals = function (records) {
  records.forEach(function(record) {
    record.technologies = record.technologies.split(',');
    record.duration = moment.duration(record.durationInSeconds, 'seconds').humanize();
    delete record.durationInSeconds;
  });
}

router.get('/other', function(req, res) {
  var locals = {};
  locals.technologyName = 'Other';
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
     join technology_video_map m \
       on v.videoId = m.videoId \
     join channels c \
       on c.channelId = v.channelId \
     where m.technologyName not in ( \
       select * from ( \
         select t.technologyName \
         from technologies t \
         join technology_video_map m \
           on m.technologyName = t.technologyName \
         where t.technologyName in ( \
           select technologyName \
           from technology_video_map m \
           join videos v \
             on m.videoId = v.videoId \
           where v.approved = 1) \
         group by t.technologyName \
         order by count(*) desc, t.technologyName desc\
         limit 9) as t) \
    group by v.videoId '

  connection.query(query + 'order by v.referrals desc', function(err, popularVideos) {
    convertRecordsToLocals(popularVideos);
    locals.popularVideos = popularVideos;
    connection.query(query + 'order by v.submissionDate desc', function(err, newVideos) {
      convertRecordsToLocals(newVideos);
      locals.newVideos = newVideos;
      res.render('technology', locals);
    });
  });
});

router.get('/:technology', function (req, res) {
  var locals = {};
  locals.technologyName = req.params.technology;
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
    where v.approved = 1 and v.videoId in ( \
      select videoId \
      from technology_video_map m \
      where m.technologyName = ' + connection.escape(req.params.technology) + ') \
      group by v.videoId ';

  connection.query(query + 'order by v.referrals desc', function(err, popularVideos) {
    convertRecordsToLocals(popularVideos);
    locals.popularVideos = popularVideos;
    connection.query(query + 'order by v.submissionDate desc', function(err, newVideos) {
      convertRecordsToLocals(newVideos);
      locals.newVideos = newVideos;
      res.render('technology', locals);
    });
  });
});

module.exports = router;
