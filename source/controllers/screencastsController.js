// @flow

import db from 'sequelize-connect'
import config from 'config'
import {createYoutubeClient} from '../util/youtube.js'
import commaSplit from 'comma-split'

const screencastsController = { }

screencastsController.handlePost = async (req: any, res: any, next: any) : any => {
  try {
    const youtube = createYoutubeClient(config.youtubeApiKey)
    const screencast = await youtube.fetchVideoDetails(req.body.url)
    screencast.tags = commaSplit(req.body.tags).map(tag => {
      return { id: tag }
    })
    screencast.url = req.body.url
    await db.models.screencast.createScreencast(screencast)
    res.sendStatus(201)
  } catch (error) {
    next(error)
  }
}

screencastsController.handleGet = async (req: any, res: any, next: any) => {
  try {
    const result = await db.models.screencast.paginate(
      config.screencastsPerPage,
      req.query.page)
    result.screencasts = result.screencasts.map(screencast => {
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
    res.status(200).json(result)
  } catch (err) {
    console.log(err)
    next(err)
  }
}

export default screencastsController
