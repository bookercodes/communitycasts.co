var express    = require('express');
var path       = require('path');
var bodyParser = require('body-parser');
var mysql      = require('mysql');
var validator  = require('express-validator');
var moment     = require('moment');

var channels     = require('./routes/channels');
var technologies = require('./routes/technologies');
var submit       = require('./routes/submit');
var home         = require('./routes/home');
var videos       = require('./routes/videos');
var api          = require('./routes/api');
var terms        = require('./routes/terms');
var about        = require('./routes/about');

var app = express();

connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'videoHub'
});
connection.connect();

// settings
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middlware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(function(req, res, next) {
  var query = 
    'select \
       t.technologyName, \
       count(*) as count \
     from technologies t \
     join technology_video_map m \
       on m.technologyName = t.technologyName \
     where t.technologyName in ( \
       select technologyName \
       from technology_video_map m \
       join videos v \
         on m.videoId = v.videoId \
       where v.approved = 1) \
     group by t.technologyName \
     order by count desc, t.technologyName desc \
     limit 9';
  connection.query(query, function(err, technologies) {
    if (technologies.length === 9) {
      technologies.push({ technologyName:'Other' });
    }
    res.locals.technologies = technologies;
    next();
  });
});

// routes
app.use('/', home);
app.use('/channels', channels);
app.use('/technologies', technologies);
app.use('/submit', submit);
app.use('/videos', videos);
app.use('/api', api);
app.use('/terms', terms);
app.use('/about', about);

app.use(function(req, res, next) {
  res.status(404).render('404');
});

app.listen(53111);
