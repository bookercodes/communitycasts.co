var express         = require('express');
var path            = require('path');
var bodyParser      = require('body-parser');
var mysql           = require('mysql');
var validator       = require('express-validator');
var moment          = require('moment');
var promise         = require('bluebird');
var session         = require('express-session');
var flash           = require('express-flash');

var screencasts     = require('./routes/screencasts');
var screencastsApi  = require('./routes/screencastsApi');

var app = express();

promise.promisifyAll(require('mysql/lib/Connection').prototype);

connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'screencastHub'
});
connection.connect();

// settings
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middlware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'hello 123',
  resave: true,
  saveUninitialized: true
}));
app.use(flash());
app.use(validator({
  errorFormatter: function(param, msg) {
    return msg;
  },
  customValidators: {
    hasLessThan3Tags: function(value) {
      var tags = value.split(',');
      tags = tags.filter(function(tag) { return tag != '' });
      tags = tags.filter(function(item, pos, self) { return self.indexOf(item) == pos; });
      return tags.length < 3;
    }
  }
}));
app.use(function(req, res, next) {
  var query = 
  'SELECT \
     tags.tagName, \
     COUNT(*) AS count \
   FROM tags \
   JOIN screencastTags \
     ON screencastTags.tagName = tags.tagName \
   WHERE tags.tagName IN ( \
     SELECT tagName \
     FROM screencastTags \
     JOIN screencasts \
       ON screencasts.screencastId = screencastTags.screencastId \
     WHERE screencasts.status = \'approved\') \
   GROUP BY tags.tagName \
   ORDER BY count DESC, tags.creationDate \
   LIMIT 9';
  connection.queryAsync(query).spread(function(tags) {
    if (tags.length === 9) {
      tags.push({ 
        tagName:'Other' 
      });
    }
    res.locals.tags = tags;
    next();
  });
});

// routes
app.use('/screencasts', screencasts);
app.use('/api/screencasts', screencastsApi);
app.get('/', function (req, res) {
  res.render('home');
});

app.get('/terms', function(req, res) {
  res.render('terms');
});
app.get('/about', function(req, res) {
  res.render('about');
});
app.get('/api/tags', function(req, res) {
  connection.queryAsync('SELECT tagName FROM tags').spread(function(tags) {
    res.send(tags);
  })
})
app.use(function(req, res, next) {
  res.status(404).render('404');
});

app.listen(53111);

