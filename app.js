var express        = require('express');
var path           = require('path');
var bodyParser     = require('body-parser');
var mysql          = require('mysql');
var validator      = require('express-validator');
var moment         = require('moment');
var youTube        = require('./youTube');

connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'videoHub'
});
connection.connect();

var channels = require('./routes/channels');
var technologies = require('./routes/technologies');
var submit = require('./routes/submit');
var index = require('./routes/index');
var videos = require('./routes/videos');
var api = require('./routes/api');
var terms = require('./routes/terms');
var about = require('./routes/about');

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
    technologies.push({technologyName:'Other'});
    res.locals.technologies = technologies;
    next();
  });
});
  
app.use('/', index);
app.use('/channels', channels);
app.use('/technologies', technologies);
app.use('/submit', submit);
app.use('/videos', videos);
app.use('/data', api);
app.use('/terms', terms);
app.use('/about', about);

app.listen(3000);