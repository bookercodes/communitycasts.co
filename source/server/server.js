'use strict';

var express = require('express');
var mysql = require('mysql');
var cors = require('cors');
var bodyParser = require('body-parser');
var youtube = require('./youtube');
var vimeo = require('./vimeo');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'communityCasts'
});
connection.connect();

var app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/screencasts/top/:period', function (req, res) {
  var query = 'SELECT COUNT(*) AS count FROM screencasts s';
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
  connection.query(query, function (error, result) {
    var page = req.query.page;
    var perPage = 5;
    var start = (page - 1) * perPage;
    var finish = page * perPage;
    var total = result[0].count;
    var totalPageCount = Math.ceil(total / perPage);
    var hasNextPage =  page < totalPageCount;
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
    query += ' ORDER BY referralCount DESC';
    query += ' LIMIT ' + start + ', ' + finish;
    connection.query(query, function (error, screencasts) {
      res.json({
        screencasts: screencasts,
        hasMore: hasNextPage
      });
    });
  });
});

app.post('/screencasts', function (req, res) {
  if (!youtube.isYouTubeUrl(req.body.link) && !vimeo.isVimeoUrl(req.body.link)) {
    res.status(400).send('You did not supply a link to a YouTube or Vimeo video.');
  } else {
    res.status(201).send();
  }
});

app.listen(3000);
