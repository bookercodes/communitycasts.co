var express = require('express');
var mysql = require('mysql');
var cors = require('cors');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'communityCasts'
});
connection.connect();

var app = express();
app.use(cors());

app.get('/screencasts', function (req, res) {
  var query = 'SELECT * FROM screencasts LIMIT 10';
  connection.query(query, function (error, screencasts) {
    res.json(screencasts);
  });
});

app.get('/screencasts/top/:period', function (req, res) {
  var query = 'SELECT * FROM screencasts s';
  switch (req.params.period) {
    case 'month':
      query += ' WHERE s.submissionDate > DATE_SUB(NOW(), INTERVAL 1 MONTH)';
      break;
    case 'week':
      query += ' WHERE s.submissionDate > DATE_SUB(NOW(), INTERVAL 1 WEEK)';
      break;
    default:
      query += ' WHERE s.submissionDate > DATE_SUB(NOW(), INTERVAL 1 DAY)';
      break;
  }
  connection.query(query, function (error, screencasts) {
    res.json(screencasts);
  });
});

app.listen(3000);
