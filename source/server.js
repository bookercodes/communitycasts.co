// @flow

import express from 'express'
import path from 'path'
import db from 'sequelize-connect'
import bodyParser from 'body-parser'
import authenticateRequest from './middleware/authenticateRequest'
import Youtube from './util/youtube.js';
import config from 'config';

const app = express()
const youtube = new Youtube(config.youtubeApiKey)

app.use(bodyParser.json())

app.get('*', (req, res) => res.json('hello'))

app.post('/api/screencasts', authenticateRequest, async (req, res) => {
  const videoDetails = await youtube.fetchVideoDetails(req.body.url)
  await db.models.Screencast.create({
    id: videoDetails.id,
    title: videoDetails.title,
    url: req.body.url,
    description: videoDetails.description,
    durationInSeconds: videoDetails.durationInSeconds
  })
  res.sendStatus(201)
})

export default app
