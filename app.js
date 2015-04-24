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
  res.locals.technologies = [ 
    'Java', 
    'Javascript', 
    'Node', 
    'Python',
    'C#'
  ];
  next();
});

app.get('/', function (req, res) {

  connection.query('select * from videos order by referrals desc', function (err, popularVideos) {

    var model = {};
    model.popularVideos = popularVideos;

    connection.query('select * from videos order by submissionDate desc', function (err, newVideos) {
      model.newVideos = newVideos;

      // res.send(model);

      res.render('index', model);
    });
  }); 

});

app.get('/videos/:videoId', function (req ,res) {
  var videoId = req.params.videoId;
  connection.query('select url from videos where videoId = ' + videoId, function (err, result) {

    var video = result[0];

    if(!video) {
      res.sendStatus(404);
      return;
    }

    res.redirect(video.url);
    connection.query('update videos set referrals = referrals + 1 where videoId = ' + videoId);
  }); 

});

app.get('/technologies/:technology', function (req, res) {

  var model = {};
  model.technology = req.params.technology;
  
  var query = "SELECT * FROM videoHub.technology_video_map m LEFT JOIN videoHub.videos v ON v.videoId = m.videoId WHERE m.technologyName = '" + req.params.technology + "' ORDER BY v.referrals DESC"
  var query2 = "SELECT * FROM videoHub.technology_video_map m LEFT JOIN videoHub.videos v ON v.videoId = m.videoId WHERE m.technologyName = '" + req.params.technology + "' ORDER BY v.submissionDate DESC"

  connection.query(query, function(err, popularVideos) {
    model.popularVideos = popularVideos;
    connection.query(query, function(err, newVideos) {
      model.newVideos = newVideos;
      res.render('index', model);
    });
  });
}) 


app.get('/submit', function(req, res) {
  res.render('submit');
});

app.post('/submit', function (req, res) {
  
  var video = req.body;
  var technologies = video.technologies.split(', ');
  delete video.technologies;

  // WARNING: PROBABLY SQLI VULN'
  var query = "insert ignore into technologies (technologyName) values ('" + technologies.join("'),('") + "')";
  connection.query(query, function (err, result) {
    connection.query('insert into videos set ?', video, function(err, result) {
      technologies.forEach(function(technology) {
        var model = { 
          videoId: result.insertId, 
          technologyName: technology 
        }
        connection.query('insert into technology_video_map set ?', model);
        res.redirect('/');
      });      
    });
  });
});

app.listen(3000);