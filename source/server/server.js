var express = require('express');
var mysql = require('mysql');
var cors = require('cors');
var sleep = require('sleep');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'communityCasts'
});
connection.connect();

var app = express();
app.use(cors());

app.get('/screencasts/top/:period', function (req, res) {

  connection.query('SELECT COUNT(*) AS count FROM screencasts', function (error, result) {


    var page = req.query.page;
    var perPage = 5;
    var start = (page - 1) * perPage;
    var finish = page * perPage;
    var total = result[0].count;
    var totalPageCount = Math.ceil(total / perPage);
    var hasNextPage =  page < totalPageCount;

    var query = 'SELECT * FROM screencasts s LIMIT ' + start + ', ' + finish;
    // switch (req.params.period) {
    //   case 'month':
    //     query += ' WHERE s.submissionDate > DATE_SUB(NOW(), INTERVAL 1 MONTH)';
    //     break;
    //   case 'week':
    //     query += ' WHERE s.submissionDate > DATE_SUB(NOW(), INTERVAL 1 WEEK)';
    //     break;
    //   default:
    //     query += ' WHERE s.submissionDate > DATE_SUB(NOW(), INTERVAL 1 DAY)';
    //     break;
    // }
    connection.query(query, function (error, screencasts) {
      res.json({
        screencasts: screencasts,
        hasMore: hasNextPage
      });
    });
  });
});

app.listen(3000);
