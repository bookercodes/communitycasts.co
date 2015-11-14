'use strict';

import cors from 'cors';
import config from 'config';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import compression from 'compression';
import validators from './validators';
import winston from 'winston';
import models from './models';
import 'winston-loggly';

winston.add(winston.transports.Loggly, config.logglyOptions);

const app = express();

app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/')));

app.enable('trust proxy');

const screencastsController = require('./controllers/screencastsController')();
app.get('/api/screencasts/', validators.paginationValidator,
  screencastsController.sendScreencasts);
app.get('/api/screencasts/tagged/:tag', validators.paginationValidator,
  screencastsController.sendScreencastsWithTag);
app.post('/api/screencasts/', validators.submissionValidator,
  screencastsController.saveScreencast);
app.get('/api/screencasts/:screencastId', screencastsController.redirectToScreencast);
app.get('/api/screencasts/search/:query', validators.paginationValidator,
  screencastsController.searchScreencasts);

import tagsController from './controllers/tagsController';
app.get('/api/tags', tagsController.send20Tags);

app.all('/*', (req, res) =>
  res.sendFile('index.html', {
    root: path.join(__dirname, '../client/')
  }));


models.sequelize.sync({
  force: false
}).then(function() {
  app.listen(config.port, () => winston.info('Server was started on port %s.', config.port));
});

process.on('uncaughtException', err => {
  winston.error(err.stack);
  process.exit(1);
});

export default app;
