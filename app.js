var express    = require('express');
var path       = require('path');
var bodyParser = require('body-parser');
var mysql      = require('mysql');

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

app.use(function(req, res, next) {
  connection.query('select technologyName from technologies', function(err, technologies) {
    res.locals.technologies = technologies;
    next();
  });
});

app.get('/', function (req, res) {
  var model = {};
  var query = 'select * from videos ';
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
    res.redirect(video.url);
    connection.query(
      'update videos \
         set referrals = referrals + 1 \
       where videoId = ' + id);
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
     where m.technologyName = ' + connection.escape(req.params.technology);
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
  var video = req.body;
  var technologies = video.technologies.split(',');
  delete video.technologies;
  var query = 'insert ignore into technologies (technologyname) values ';
  technologies.forEach(function(technology) {
    query += '(' + connection.escape(technology) + '),';
  });
  query = query.substr(0, query.length - 1);
  connection.query(query, function (err, result) {
    connection.query('insert into videos set ?', video, function(err, result) {
      technologies.forEach(function(technology) {
        var model = { 
          videoId: result.insertId, 
          technologyName: technology 
        }
        connection.query('insert into technology_video_map set ?', model);
      });   
      res.redirect('/');
    });
  });
});

app.listen(3000);