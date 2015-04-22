var express = require('express');
var path    = require('path');

var app = express();

app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.render('index', { 
    technologies: [ 
      'Java', 
      'Javascript', 
      'Node', 
      'Mongo',
      'C#'] 
  });
});

app.listen(3000);