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
var winston = require('winston');

promise.promisifyAll(require('mysql/lib/Connection').prototype);

require('winston-loggly');
winston.add(winston.transports.Loggly, config.logglyOptions);

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: config.databasePassword,
  database: 'communityCasts'
});
connection.connect();
connection.on('error', function(error) {
  winston.error(error);
});

var app = express();

app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/')));

app.enable('trust proxy');

var screencastsController = require('./controllers/screencastsController')(
  connection);

app.get('/api/screencasts/', validators.paginationValidator,
  screencastsController.sendScreencasts);
app.get('/api/screencasts/tagged/:tag', validators.paginationValidator,
  screencastsController.sendScreencastsWithTag);
app.post('/api/screencasts/', validators.submissionValidator,
  screencastsController.saveScreencast);
app.get('/screencasts/:screencastId', screencastsController.redirectToScreencast);

var tagsController = require('./controllers/tagsController')(connection);
app.get('/api/tags', tagsController.send20Tags);

app.all('/*', function(req, res) {
  res.sendFile('index.html', {
    root: path.join(__dirname, '../client/')
  });
});

app.listen(config.port, function () {
  winston.info('Server was started on port %s.', config.port);
});

process.on('uncaughtException', function (err) {
  winston.error(err.stack);
  process.exit(1);
});
