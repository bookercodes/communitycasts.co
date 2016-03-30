// @flow

import express from 'express'
import path from 'path'
import db from 'sequelize-connect'
import bodyParser from 'body-parser'

let app: any = express()
app.use(bodyParser.json())

app.get('*', (req, res) => res.json('hello'))

app.post('/api/screencasts', async (req, res) => {
  await db.models.Screencast.create({
    url: req.body.url
  })
  res.sendStatus(201)
})

export default app
