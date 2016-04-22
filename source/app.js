// @flow

import express from 'express'
import path from 'path'
import db from 'sequelize-connect'
import bodyParser from 'body-parser'
import authenticateRequest from './middleware/authenticateRequest'
import config from 'config';
import screencastsController from './controllers/screencastsController.js'
import validateSubmitScreencastReq from './middleware/submitScreencastValidator.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()

// app.use(errorHandler)
app.use(bodyParser.json())

app.post(
  '/api/screencasts',
  authenticateRequest,
  validateSubmitScreencastReq,
  screencastsController.handlePost)

export default app
