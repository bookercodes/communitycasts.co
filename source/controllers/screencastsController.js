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

screencastsController.handleGet = async (req: any, res: any, next: any) => {
  try {
    const foundScreencasts = await db
      .models
      .screencast
      .findAll({
        include: [
          { model: db.models.channel },
          { model: db.models.tag }
        ]
      })
      .map(screencast => {
        screencast = screencast.dataValues
        return {
          id: screencast.id,
          url: screencast.url,
          title: screencast.title,
          description: screencast.description,
          durationInSeconds: screencast.durationInSeconds,
          channel: {
            id: screencast.channel.dataValues.id,
            name: screencast.channel.dataValues.name
          },
          tags: screencast.tags.map(tag => tag.dataValues.id)
        }
      })
    res.status(200).json(foundScreencasts)
  } catch (err) {
    next(err)
  }
}

export default screencastsController
