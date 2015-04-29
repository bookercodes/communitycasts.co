var express = require('express');
var router = express.Router();
var youTube        = require('../youTube');
var ytClient = new youTube('AIzaSyCKQFYlDRi5BTd1A-9rhFjF8Jb_Hlfnquk');
var moment         = require('moment');

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
  var query = 'select * from videos where videoId = ' + connection.escape(videoId);
  connection.query(query, function (err, result) {
    // if the query results in one or more records, then a video with this
    // id already exists and we must reject it.
    var alreadyExists = result.length >= 1;
    if (alreadyExists) {
      res.render('submit', { errors: [{ msg:'This video has already been submitted.' }] })
      return;
    }
    ytClient.getInfo(videoId, function(video) {
      if (video == null) {
        res.render('submit', { errors: [{ msg:'This video could not be found.' }] })
        return;
      }
      connection.query('insert ignore into channels set ?', video.channel, function(err, result) {
        var record = {
          videoId: videoId,
          channelId: video.channel.channelId,
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          durationInSeconds: moment.duration(video.duration).asSeconds(),
          hd: video.hd
        }
        connection.query('insert into videos set ?', record, function(err, result) {
          var technologies = req.body.technologies.split(',');
          var query = 'insert ignore into technologies (technologyname) values ';
          technologies.forEach(function(technology) {
            query += '(' + connection.escape(technology) + '),';
          });
          query = query.substr(0, query.length - 1);

          connection.query(query, function(err, result) {
            technologies.forEach(function(technology, index, array) {
              var record = { 
                videoId: videoId, 
                technologyName: technology 
              }
              connection.query('insert into technology_video_map set ?', record, function(err, result) {
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