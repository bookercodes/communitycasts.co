'use strict';

var cors = require('cors');
var config = require('config');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var compression = require('compression');
var validators = require('./validators');
var winston = require('winston');

require('winston-loggly');
winston.add(winston.transports.Loggly, config.logglyOptions);

var app = express();

app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/')));

app.use(function(req, res, next) {
  console.log(req.originalUrl);
  next();
});

app.enable('trust proxy');

var screencastsController = require('./controllers/screencastsController')();
app.get('/api/screencasts/', validators.paginationValidator,
  screencastsController.sendScreencasts);
app.get('/api/screencasts/tagged/:tag', validators.paginationValidator,
  screencastsController.sendScreencastsWithTag);
app.post('/api/screencasts/', validators.submissionValidator,
  screencastsController.saveScreencast);
app.get('/api/screencasts/:screencastId', screencastsController.redirectToScreencast);
app.get('/api/screencasts/search/:query', validators.paginationValidator,
  screencastsController.searchScreencasts);

var tagsController = require('./controllers/tagsController');
app.get('/api/tags', tagsController.send20Tags);

app.all('/*', (req, res) =>
  res.sendFile('index.html', {
    root: path.join(__dirname, '../client/')
  }));

app.listen(config.port, () => winston.info('Server was started on port %s.', config.port));

process.on('uncaughtException', function (err) {
  winston.error(err.stack);
  process.exit(1);
});
