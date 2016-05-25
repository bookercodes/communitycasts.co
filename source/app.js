// @flow

import express from 'express'
import bodyParser from 'body-parser'
import authenticateRequest from './middleware/authenticateRequest'
import screencastsController from './controllers/screencastsController.js'
import validateSubmitScreencastReq from './middleware/submitScreencastValidator.js'
// import errorHandler from './middleware/errorHandler.js'

const app = express()

// app.use(errorHandler)
app.use(bodyParser.json())

app.post(
  '/api/screencasts',
  authenticateRequest,
  validateSubmitScreencastReq,
  screencastsController.handlePost)

app.get(
  '/api/screencasts',
  screencastsController.handleGet
)

app.get(
  '/api/screencasts/:screencastId',
  screencastsController.sendScreencast
)

export default app
