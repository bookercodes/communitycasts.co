var express = require('express');
var router  = express.Router();
var common  = require('../common');

router.get('/', function(req,res) {
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

router.get('/tagged/other', function(req, res) {

  var body = {};
  var query = 
  'SELECT \
     COUNT(m.tagName) AS total \
   FROM screencastTags m \
   WHERE m.tagName NOT IN ( \
     SELECT * FROM ( \
       SELECT t.tagName \
       FROM tags t \
       JOIN screencastTags m \
         ON m.tagName = t.tagName \
       WHERE t.tagName in ( \
         SELECT tagName \
         FROM screencastTags m \
         JOIN screencasts v \
           ON m.screencastId = v.screencastId \
         WHERE v.approved = 1) \
       GROUP by t.tagName \
       ORDER BY COUNT(*) desc, t.tagName desc \
       LIMIT 9) as t)';

  connection.query(query, function (err, result) {
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
     JOIN screencastTags m \
       ON v.screencastId = m.screencastId \
     JOIN channels c \
       ON c.channelId = v.channelId \
     WHERE m.tagName not in ( \
       SELECT * FROM ( \
         SELECT t.tagName \
         FROM tags t \
         JOIN screencastTags m \
           ON m.tagName = t.tagName \
         WHERE t.tagName in ( \
           SELECT tagName \
           FROM screencastTags m \
           JOIN screencasts v \
             ON m.screencastId = v.screencastId \
           WHERE v.approved = 1) \
         GROUP by t.tagName \
         ORDER BY COUNT(*) desc, t.tagName desc\
         LIMIT 9) as t) \
    GROUP by v.screencastId '
    if (req.query.sort === 'popular')
      query += ' ORDER BY v.referralCount desc';
    else
      query += ' ORDER BY v.submissionDate desc';
    query += ' LIMIT ' + parseInt(req.query.offset) + ', ' + parseInt(req.query.limit);
    connection.query(query, function(err, records) {
      common.convertRecordsToLocals(records);
      body.rows = records;
      res.send(body);
    });
  });
});

router.get('/tagged/:technology',function(req,res) { 
  var body = {};
  var query = 
  'SELECT COUNT(*) as total \
   FROM tags t \
   JOIN screencastTags m \
     ON m.tagName = t.tagName \
   WHERE t.tagName = ' + connection.escape(req.params.technology) + '\
   GROUP by t.tagName';

  connection.query(query, function(err, result) {
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
    WHERE v.approved = 1 and v.screencastId in ( \
      SELECT screencastId \
      FROM screencastTags m \
      WHERE m.tagName = ' + connection.escape(req.params.technology) + ') \
      GROUP BY v.screencastId';
    if (req.query.sort === 'popular')
      query += ' ORDER BY v.referralCount DESC';
    else  
      query += ' ORDER BY v.submissionDate DESC';
    query += ' LIMIT ' + parseInt(req.query.offset) + ', ' + parseInt(req.query.limit);

    connection.query(query, function(err, popularVideos) {
      common.convertRecordsToLocals(popularVideos);
      body.rows = popularVideos;
      res.send(body);
    });
  });
});



module.exports = router;