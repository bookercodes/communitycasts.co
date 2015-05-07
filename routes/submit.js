var express = require('express');
var moment  = require('moment');
var common  = require('../common');

var router  = express.Router();

router.get('/', function(req, res) {
  res.render('submit');
});

function extractIdFromUrl (url) {
  var pattern = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = url.match(pattern);
  if (match && match[2].length == 11) {
    return match[2];
  }
}

router.post('/', function (req, res) {
  req.checkBody('url', 'YouTube Url is missing.').notEmpty();
  req.checkBody('url', 'Url must be a YouTube url.')
    .matches(/^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/);
  req.checkBody('technologies', 'Please enter at least one technology.').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    res.render('submit', { errors: errors });
    return;
  }
  var videoId = extractIdFromUrl(req.body.url);
  var query = 'SELECT * FROM screencasts WHERE screencastId = ' + connection.escape(videoId);
  connection.query(query, function (err, result) {
    // if the query results in one or more records, then a video with this
    // id already exists and we must reject it.
    var alreadyExists = result.length >= 1;
    if (alreadyExists) {
      res.render('submit', { errors: [{ msg:'This video has already been submitted.' }] })
      return;
    }
    common.getVideo(videoId, function(video) {
      if (video == null) {
        res.render('submit', { errors: [{ msg:'This video could not be found.' }] })
        return;
      }
      connection.query('INSERT IGNORE INTO channels SET ?', video.channel, function(err, result) {
                  if (err) {
            console.log(err);
          }
        var record = {
          screencastId: videoId,
          channelId: video.channel.channelId,
          title: video.title,
          durationInSeconds: moment.duration(video.duration).asSeconds(),
        }
        connection.query('INSERT INTO screencasts SET ?', record, function(err, result) {
          if (err) {
            console.log(err);
          }
          var technologies = req.body.technologies.split(',');
          var query = 'INSERT IGNORE INTO tags VALUES ';
          technologies.forEach(function(technology) {
            query += '(' + connection.escape(technology) + '),';
          });
          query = query.substr(0, query.length - 1);

          connection.query(query, function(err, result) {
                      if (err) {
            console.log(err);
          }
            technologies.forEach(function(technology, index, array) {
              var record = { 
                screencastId: videoId, 
                tagName: technology 
              }
              connection.query('INSERT INTO screencastTags SET ?', record, function(err, result) {
                          if (err) {
            console.log(err);
          }
                // if this is the final iteration, redirect the user.
                if (index === array.length - 1) {
                  res.redirect('/');
                }
              });
            }); 
          })
        });
      });
    });
  });
});

module.exports = router;