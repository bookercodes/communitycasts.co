// @flow

import db from 'sequelize-connect'
import config from 'config'
import {createYoutubeClient} from '../util/youtube.js'
import commaSplit from 'comma-split'

const screencastsController = { }

screencastsController.handlePost = async (req: any, res: any, next: any) : any => {
  const youtube = createYoutubeClient(config.youtubeApiKey)
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

    // This is too generic but it's ok. Soon I will validate whether or not
    // the video exists before executing this route handler. If it somehow
    // exists after validation, a generic 500 error should be thrown.
    if (error.name === 'Error') {
      res.status(400).send('This screencast cannot be found')
      res.sendStatus(400)
      return
    }
    next(error)
  }
}

export default screencastsController
