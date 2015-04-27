var express        = require('express');
var path           = require('path');
var bodyParser     = require('body-parser');
var mysql          = require('mysql');
var validator      = require('express-validator');
var moment         = require('moment');
var youTube        = require('./youTube');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'videoHub'
});
connection.connect();

var app = express();
var ytClient = new youTube('AIzaSyCKQFYlDRi5BTd1A-9rhFjF8Jb_Hlfnquk');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());

app.use(function(req, res, next) {
  // find all technologies who are associated with approved videos
  var query = 
    'select technologyName \
     from technologies \
     where technologyName in ( \
      select technologyName \
      from technology_video_map m \
      left join videos v \
        on m.videoId = v.videoId \
      where v.approved = 1)';
  connection.query(query, function(err, technologies) {
    res.locals.technologies = technologies;
    next();
  });
});

app.get('/technologies/:technology', function (req, res) {
  var model = {};
  model.technologyName = req.params.technology;
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
    where v.approved = 1 and m.technologyname = ' + connection.escape(req.params.technology) +
    ' group by v.videoId ';
  var x = connection.query(query + 'order by v.referrals desc', function(err, popularVideos) {
    popularVideos.forEach(function(record) {
      record.technologies = record.technologies.split(',');
      record.duration = moment.duration(record.durationInSeconds, 'seconds').humanize();
      delete record.durationInSeconds;
    });
    model.popularVideos = popularVideos;
    connection.query(query + 'order by v.submissionDate desc', function(err, newVideos) {
      newVideos.forEach(function(record) {
        record.technologies = record.technologies.split(',');
        record.duration = moment.duration(record.durationInSeconds, 'seconds').humanize();
        delete record.durationInSeconds;
      });
      model.newVideos = newVideos;
      res.render('technology', model);
    });
  });
});

app.get('/', function (req, res) {
  var model = {};
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
    group by v.videoId ';

  connection.query(query + 'order by v.referrals desc', function(err, records) {
    records.forEach(function(record) {
      record.technologies = record.technologies.split(',');
      record.duration = moment.duration(record.durationInSeconds, 'seconds').humanize();
      delete record.durationInSeconds;
    });
    model.popularVideos = records;

    connection.query(query + 'order by v.submissionDate desc', function(err, records) {
      records.forEach(function(record) {
        record.technologies = record.technologies.split(',');
        record.duration = moment.duration(record.durationInSeconds, 'seconds').humanize();
        delete record.durationInSeconds;
      });
      model.newVideos = records;
      res.render('index', model);
    });
  });
});

app.get('/videos/:videoId', function (req ,res) {
  var id = connection.escape(req.params.videoId);
  connection.query('select videoId from videos where videoId = ' + id, function (err, result) {
    var video = result[0];
    if(!video) {
      res.sendStatus(404);
      return;
    }
    res.redirect('https://www.youtube.com/watch?v=' + video.videoId);
    var query = 'select 1 \
      from referrals \
      where videoId = '+ id + ' and refereeIp = ' + connection.escape(req.connection.remoteAddress);
    connection.query(query, function(err, result) {
      var referral = result[0]
      if (!referral) {
        connection.query(
          'update videos \
             set referrals = referrals + 1 \
           where videoId = ' + id);
        connection.query('insert into referrals set ?', { 
          videoId: req.params.videoId, 
          refereeIp: req.connection.remoteAddress
        });
      }
    });
  }); 
});

app.get('/submit', function(req, res) {
  res.render('submit');
});

app.post('/submit', function (req, res) {
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

app.get('/channels', function(req, res) {
  connection.query('select * from channels', function (err, result) {
    res.render('channels', {
      channels: result
    });
  });
});

// route the redirect through the server in case we want to count referrals in the future.
app.get('/channel/:channelId', function(req, res) {
  res.redirect('https://www.youtube.com/channel/' + req.params.channelId);
});

app.get('/terms', function(req, res) {
  res.render('terms');
});

app.get('/about', function(req, res) {
  res.render('about');
});

app.get('/data/', function(req,res) {

  var model = {};
  connection.query('select count(*) as total from videos; ', function(err, result) {
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

    connection.query(query, function (err, result) {
      result.forEach(function(record) {
        record.technologies = record.technologies.split(',');
        record.duration = moment.duration(record.durationInSeconds, 'seconds').humanize();
        delete record.durationInSeconds;
      });
      model.rows = result;
      res.send(model);
    });

  });
});

app.listen(53111);