'use strict';

var cors = require('cors');
var mysql = require('mysql');
var config = require('config');
var express = require('express');
var promise = require('bluebird');
var bodyParser = require('body-parser');
var path = require('path');
var compression = require('compression');
var validators = require('./validators');

promise.promisifyAll(require('mysql/lib/Connection').prototype);

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: config.databasePassword,
  database: 'communityCasts'
});
connection.connect();

var app = express();

app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/')));

var screencastsController = require('./controllers/screencastsController')(
  connection);

app.get('/screencasts/', validators.createPaginationValidator,
  screencastsController.sendScreencasts);
app.get('/screencasts/tagged/:tag', validators.createPaginationValidator,
  screencastsController.sendScreencastsWithTag);
app.post('/screencasts/', validators.createSubmissionValidator,
  screencastsController.saveScreencast);
app.get('/screencasts/:screencastId', screencastsController.redirectToScreencast);

var tagsController = require('./controllers/tagsController')(connection);
app.get('/tags', tagsController.send20Tags);

// https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-configure-your-server-to-work-with-html5mode
app.all('/*', function(req, res) {
  res.sendFile('index.html', {
    root: path.join(__dirname, '../client/')
  });
});

app.listen(config.port);
