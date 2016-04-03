// @flow

import db from 'sequelize-connect'
import config from 'config'
import Youtube from '../util/youtube.js'

const screencasts = {
  post: async (req: any, res: any) : any => {
    const youtube = new Youtube(config.youtubeApiKey)
    const videoDetails = await youtube.fetchVideoDetails(req.body.url)
    try {
      await db.models.Screencast.create({
        ...videoDetails,
        url: req.body.url
      })
      res.sendStatus(201)
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.sendStatus(409)
      }
    }
  }
}

export default screencasts
