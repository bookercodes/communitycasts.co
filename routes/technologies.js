var express = require('express');
var router  = express.Router();
var common  = require('../common')

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
    common.convertRecordsToLocals(popularVideos);
    locals.popularVideos = popularVideos;
    connection.query(query + 'order by v.submissionDate desc', function(err, newVideos) {
      common.convertRecordsToLocals(newVideos);
      locals.newVideos = newVideos;
      res.render('technology', locals);
    });
  });
});

router.get('/:technology', function (req, res) {
  res.render('technology', {technologyName:req.params.technology});
});

router.get('/api/:technology',function(req,res) { 
  var body = {};
  var query = 
  'select count(*) as total \
   from technologies t \
   join technology_video_map m \
     on m.technologyName = t.technologyName \
   where t.technologyName = ' + connection.escape(req.params.technology) + '\
   group by t.technologyName';

  connection.query(query, function(err, result) {
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
    where v.approved = 1 and v.videoId in ( \
      select videoId \
      from technology_video_map m \
      where m.technologyName = ' + connection.escape(req.params.technology) + ') \
      group by v.videoId';
    if (req.query.kind === 'popular')
      query += ' order by v.referrals desc';
    else
      query += ' order by v.submissionDate desc';
    query += ' limit ' + req.query.offset + ', ' + req.query.limit;

    connection.query(query, function(err, popularVideos) {
      if (err) { res.send(err); return;}
      common.convertRecordsToLocals(popularVideos);
      body.rows = popularVideos;
      res.send(body);
    });
  });
});

// router.get('api/:technology', function (req, res) {
//   var locals = {};
//   locals.technologyName = req.params.technology;
//     var query = 
//     'select \
//        v.videoId, \
//        v.title, \
//        c.channelId, \
//        c.channelName, \
//        v.durationInSeconds, \
//        v.submissionDate, \
//        GROUP_CONCAT(m.technologyName) as technologies \
//     from videos v \
//     join channels c \
//       on c.channelId = v.channelId \
//     join technology_video_map m \
//       on m.videoId = v.videoId \
//     where v.approved = 1 and v.videoId in ( \
//       select videoId \
//       from technology_video_map m \
//       where m.technologyName = ' + connection.escape(req.params.technology) + ') \
//       group by v.videoId ';

//   connection.query(query + 'order by v.referrals desc', function(err, popularVideos) {
//     common.convertRecordsToLocals(popularVideos);
//     locals.popularVideos = popularVideos;
//     connection.query(query + 'order by v.submissionDate desc', function(err, newVideos) {
//       common.convertRecordsToLocals(newVideos);
//       locals.newVideos = newVideos;
//       res.render('technology', locals);
//     });
//   });
// });

module.exports = router;
