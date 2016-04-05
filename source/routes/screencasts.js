// @flow

import db from 'sequelize-connect'
import config from 'config'
import Youtube from '../util/youtube.js'
import commaSplit from 'comma-split'

const screencasts = {
  post: async (req: any, res: any) : any => {
    const youtube = new Youtube(config.youtubeApiKey)
    try {
      const videoDetails = await youtube.fetchVideoDetails(req.body.url)
      const tags = commaSplit(req.body.tags).map(tag => ({ id: tag }))

      await db.sequelize.transaction(async transaction => {
        await db.models.Tag.bulkCreate(tags, {
          transaction
        })
        await db.models.Screencast.create({
          ...videoDetails,
          url: req.body.url
        }, {
          transaction
        })
        var screencastTags = tags.map(function(tag) {
          return {
            screencastId: videoDetails.id,
            tagId: tag.id
          };
        });
        await db.models.ScreencastTag.bulkCreate(screencastTags, {
          transaction
        })
      })
      res.sendStatus(201)
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.sendStatus(409)
        return
      }
      if (error.name === 'YoutubeVideoDoesNotExist') {
        res.status(400).send('This screencast cannot be found')
        res.sendStatus(400)
      }
    }
  }
}

export default screencasts
