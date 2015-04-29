var express = require('express');
var router = express.Router();
var youTube        = require('../youTube');
var ytClient = new youTube('AIzaSyCKQFYlDRi5BTd1A-9rhFjF8Jb_Hlfnquk');
var moment         = require('moment');

router.get('/', function(req, res) {
  res.render('submit');
});

router.post('/', function (req, res) {
  // validate input
  req.checkBody('url', 'YouTube Url is missing.').notEmpty();
  req.checkBody('url', 'Url must be a YouTube url.').matches(/^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/);
  req.checkBody('technologies', 'Please enter at least one technology.').notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    res.render('submit', {
      errors: errors
    });
    return;
  }

  var videoId = ytClient.extractId(req.body.url);

  // check if video with the given id already exists in the db
  var query = 'select * from videos where videoId = ' + connection.escape(videoId);
  connection.query(query, function (err, result) {
    var alreadySubmitted = result.length === 1;
    if (alreadySubmitted) {
      res.render('submit', {
        errors: [{ msg:'This video has already been submitted.' }]
      })
      return;
    }
    // download information about the video
    ytClient.getInfo(videoId, function(video) {
      // insert channel
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
        // insert video
        connection.query('insert into videos set ?', record, function(err, result) {
          var technologies = req.body.technologies.split(',');
          var query = 'insert ignore into technologies (technologyname) values ';
          technologies.forEach(function(technology) {
            query += '(' + connection.escape(technology) + '),';
          });
          query = query.substr(0, query.length - 1);
          // insert tags
          connection.query(query, function(err, result) {
            technologies.forEach(function(technology, index, array) {
              var record = { 
                videoId: videoId, 
                technologyName: technology 
              }
              // insert video - tag maps
              connection.query('insert into technology_video_map set ?', record, function(err, result) {

                if (index === array.length - 1)
                  res.redirect('/');

              });
            }); 
          })
        });
      });
    });
  });
});

module.exports = router;