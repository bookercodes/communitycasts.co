// @flow

import express from 'express'
import path from 'path'
import db from 'sequelize-connect'
import bodyParser from 'body-parser'

const app = express()

app.use(bodyParser.json())

app.get('*', (req, res) => res.json('hello'))

function authenticateRequest(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    res.sendStatus(401)
    return
  }
  const encodedPassword = authHeader.split('Basic: ')[1]
  const password = new Buffer(encodedPassword, 'base64').toString()
  if (password !== 'password') {
    res.sendStatus(401)
    return
  }
  next()
}

app.post('/api/screencasts', authenticateRequest, async (req, res) => {
  await db.models.Screencast.create({
    url: req.body.url
  })
  res.sendStatus(201)
})

export default app
