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

app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  res.locals.technologies = [ 
    'Java', 
    'Javascript', 
    'Node', 
    'Mongo',
    'C#'
  ];
  next();
});
// AIzaSyCKQFYlDRi5BTd1A-9rhFjF8Jb_Hlfnquk
app.get('/', function (req, res) {

  connection.query('select * from videos', function (err, videos) {
    res.render('index', {videos: videos});
  }); 

});

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