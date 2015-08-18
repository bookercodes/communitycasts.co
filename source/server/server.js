'use strict';

var cors = require('cors');
var mysql = require('mysql');
var config = require('config');
var express = require('express');
var promise = require('bluebird');
var bodyParser = require('body-parser');

promise.promisifyAll(require('mysql/lib/Connection').prototype);

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: config.databasePassword,
  database: 'communityCasts'
});
connection.connect();

var app = express();

app.use(cors());
app.use(bodyParser.json());

var screencastsController = require('./controllers/screencastsController')(connection);
app.get('/screencasts/', screencastsController.sendScreencasts);
app.get('/screencasts/tagged/:tag', screencastsController.sendScreencastsWithTag);
app.get('/screencasts/:screencastId', screencastsController.redirectToScreencast);

var tagsController = require('./controllers/tagsController')(connection);
app.get('/tags', tagsController.send20Tags);

app.listen(3000);
