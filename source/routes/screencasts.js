// @flow

import db from 'sequelize-connect'
import config from 'config'
import Youtube from '../util/youtube.js'

const screencasts = {
  post: async (req: any, res: any) : any => {
    const youtube = new Youtube(config.youtubeApiKey)
    const videoDetails = await youtube.fetchVideoDetails(req.body.url)
    await db.models.Screencast.create({
      ...videoDetails,
      url: req.body.url
    })
    res.sendStatus(201)
  }
}
export default screencasts
