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
  var query = 'SELECT * FROM screencasts';
  connection.query(query, function (error, screencasts) {
    res.json(screencasts);
  });
});

app.listen(3000);
