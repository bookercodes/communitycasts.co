// @flow

import express from 'express'
import path from 'path'
import db from 'sequelize-connect'
import bodyParser from 'body-parser'
import authenticateRequest from './middleware/authenticateRequest'
import config from 'config';
import home from './routes/home'
import screencast from './routes/screencasts.js'
import validateScreencastInput from './middleware/validateScreencastInput.js'
import errorHandler from './middleware/errorHandler.js'


const app = express()

// app.use(errorHandler)
app.use(bodyParser.json())

app.get('/', home.get)

app.post(
  '/api/screencasts',
  authenticateRequest,
  validateScreencastInput,
  screencast.post)

export default app
