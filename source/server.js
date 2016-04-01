// @flow

import express from 'express'
import path from 'path'
import db from 'sequelize-connect'
import bodyParser from 'body-parser'
import authenticateRequest from './middleware/authenticateRequest'

const app = express()

app.use(bodyParser.json())

app.get('*', (req, res) => res.json('hello'))

app.post('/api/screencasts', authenticateRequest, async (req, res) => {
  await db.models.Screencast.create({
    url: req.body.url
  })
  res.sendStatus(201)
})

export default app
