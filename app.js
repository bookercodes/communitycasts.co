var express        = require('express');
var path           = require('path');
var bodyParser     = require('body-parser');
var mysql          = require('mysql');
var validator      = require('express-validator');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'videoHub'
});
connection.connect();

var app = express();

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

app.get('/', function (req, res) {
  var model = {};
  var query = 'select * from videos where approved = 1 ';
  connection.query(query + 'order by referrals desc', function (err, videos) {
    model.popularVideos = videos;
    connection.query(query + 'order by submissionDate desc', function (err, videos) {
      model.newVideos = videos;
      res.render('index', model);
    });
  }); 
});

app.get('/videos/:videoId', function (req ,res) {
  var id = connection.escape(req.params.videoId);
  connection.query('select url from videos where videoId = ' + id, function (err, result) {
    var video = result[0];
    if(!video) {
      res.sendStatus(404);
      return;
    }
    res.redirect('https://www.youtube.com/watch?v=' + video.url);
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

app.get('/technologies/:technology', function (req, res) {
  var model = {};
  model.technology = req.params.technology;
  var query = 
    'select * \
     from technology_video_map m \
     left join videoHub.videos v \
       on v.videoId = m.videoId \
     where v.approved = 1 and m.technologyName = ' + connection.escape(req.params.technology);
  connection.query(query + 'order by v.referrals desc', function(err, popularVideos) {
    model.popularVideos = popularVideos;
    connection.query(query + 'order by v.submissionDate desc', function(err, newVideos) {
      model.newVideos = newVideos;
      res.render('index', model);
    });
  });
});

app.get('/submit', function(req, res) {
  res.render('submit');
});

app.post('/submit', function (req, res) {
  req.checkBody('url', 'YouTube Url is missing.').notEmpty();
  req.checkBody('url', 'Url must be a YouTube url.').matches(/^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/);
  req.checkBody('title', 'Title is missing.').notEmpty();
  req.checkBody('description', 'Description is missing.').notEmpty();
  req.checkBody('channelName', 'Channel name is missing.').notEmpty();
  req.checkBody('technologies', 'Please enter at least one technology.').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    res.render('submit', {
      errors: errors
    });
    return;
  }
  connection.query('select * from videos where url = \'' + extractId(req.body.url) + '\'', function (err, result) {

    var exists = !!result[0];
    if (exists) {
      res.render('submit', {
        errors: [{msg:'This video has already been submitted.'}]
      });
      return;
    }

    var video = req.body;
    var technologies = video.technologies.split(',');
    delete video.technologies;
    var query = 'insert ignore into technologies (technologyname) values ';
    technologies.forEach(function(technology) {
      query += '(' + connection.escape(technology) + '),';
    });
    query = query.substr(0, query.length - 1);
    connection.query(query, function (err, result) {
      video.url = extractId(video.url);
      connection.query('insert into videos set ?', video, function(err, result) {
        technologies.forEach(function(technology) {
          var model = { 
            videoId: result.insertId, 
            technologyName: technology 
          }
          connection.query('insert into technology_video_map set ?', model);
        });   
        res.render('submit', {
          message: 'Thank you for your submission. Your video will appear in the list as soon as it has been approved.'
        });
      });
    });
  });
});

function extractId(url) {
  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = url.match(regExp);
  if (match && match[2].length == 11) {
    return match[2];
  }
}

app.listen(3000);