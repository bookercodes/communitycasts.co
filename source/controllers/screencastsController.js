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
      var screencastTags = tags.map(function (tag) {
        return {
          screencastId: videoDetails.id,
          tagId: tag.id
        }
      })
      await db.models.ScreencastTag.bulkCreate(screencastTags, {
        transaction
      })
    })
    res.sendStatus(201)
  } catch (error) {
    next(error)
  }
}

export default screencastsController
