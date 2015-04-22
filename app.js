var express = require('express');
var path    = require('path');

var app = express();

app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/submit', function(req, res) {
  res.render('submit');
});

app.listen(3000);