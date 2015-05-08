var express = require('express');
var router  = express.Router();
var common  = require('../common');

router.get('/', function(req, res) {
  var response = {};
  connection.queryAsync('SELECT COUNT(*) AS screncastCount FROM screencasts').spread(function(records) {
    response.total = records[0].screncastCount
    var query = 
      'SELECT \
         screencasts.screencastId, \
         screencasts.title, \
         channels.channelId, \
         channels.channelName, \
         screencasts.durationInSeconds, \
         screencasts.submissionDate, \
         GROUP_CONCAT(screencastTags.tagName) AS tags \
       FROM screencasts screencasts \
       JOIN channels \
         ON channels.channelId = screencasts.channelId \
       JOIN screencastTags screencastTags \
         ON screencastTags.screencastId = screencasts.screencastId \
       WHERE screencasts.approved = 1 \
       GROUP BY screencasts.screencastId';
      if (req.query.sort === 'popular') 
        query += ' ORDER BY screencasts.referralCount DESC';
      else 
        query += ' ORDER BY screencasts.submissionDate DESC';
      query += ' LIMIT ' + parseInt(req.query.offset) + ', ' + parseInt(req.query.limit);
      return connection.queryAsync(query);
  }).spread(function(screencasts) {
    common.convertRecordsToLocals(screencasts);
    response.rows = screencasts;
    res.send(response);
  });
});

router.get('/tagged/other', function(req, res) {
  var response = {};
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
  connection.queryAsync(query).spread(function (records) {
    response.total = records[0].total;
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
      return connection.queryAsync(query);
  }).spread(function(screencasts) {
    common.convertRecordsToLocals(screencasts);
    response.rows = screencasts;
    res.send(response);
  });
});

router.get('/tagged/:technology',function(req,res) { 
  var response = {};
  var query = 
    'SELECT COUNT(*) as total \
     FROM tags t \
     JOIN screencastTags m \
       ON m.tagName = t.tagName \
     WHERE t.tagName = ' + connection.escape(req.params.technology) + '\
     GROUP by t.tagName';
  connection.queryAsync(query).spread(function(records) {
    response.total = records[0].total;
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
    return connection.queryAsync(query);
  }).spread(function (screencasts) {
    common.convertRecordsToLocals(screencasts);
    response.rows = screencasts;
    res.send(response);
  });
});

module.exports = router;