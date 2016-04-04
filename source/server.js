// @flow

import express from 'express'
import path from 'path'
import db from 'sequelize-connect'
import bodyParser from 'body-parser'
import authenticateRequest from './middleware/authenticateRequest'
import Youtube from './util/youtube.js';
import config from 'config';
import home from './routes/home'
import screencast from './routes/screencasts.js'
import validateScreencastInput from './middleware/validateScreencastInput.js'

const app = express()

app.use(bodyParser.json())

app.get('/', home.get)
app.post(
  '/api/screencasts',
  validateScreencastInput,
  authenticateRequest,
  screencast.post)

export default app
