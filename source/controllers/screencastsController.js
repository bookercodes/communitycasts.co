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
    const tags = commaSplit(req.body.tags).map(tag => {
      return { id: tag }
    })
    await db.sequelize.transaction(async transaction => {
      const createdChannel = await db.models.channel.create({
        id: videoDetails.channel.id,
        name: videoDetails.channel.title
      })
      await createdChannel.createScreencast({
        ...videoDetails,
        url: req.body.url
      }, {
        transaction
      })
      await db.models.tag.bulkCreate(tags, {
        transaction
      })
      const screencastTags = tags.map(tag => {
        return {
          screencastId: videoDetails.id,
          tagId: tag.id
        }
      })
      await db.models.screencastTag.bulkCreate(screencastTags, {
        transaction
      })
    })
    res.sendStatus(201)
  } catch (error) {
    next(error)
  }
}

export default screencastsController
