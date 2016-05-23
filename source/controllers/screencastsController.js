// @flow

import db from 'sequelize-connect'
import config from 'config'
import {createYoutubeClient} from '../util/youtube.js'
import mapper from '../util/modelMapper'

const screencastsController = { }

screencastsController.handlePost = async (req: Request, res: Response, next: NextFunction): any => {
  try {
    const client = createYoutubeClient(config.youtubeApiKey)
    const details = await client.fetchVideoDetails(req.body.url)
    await db.models.screencast.createScreencast({
      ...details,
      url: req.body.url,
      tags: mapper.mapTags(req.body.tags)
    })
    res.sendStatus(201)
  } catch (error) {
    next(error)
  }
}

screencastsController.handleGet = async (req: Request, res: Response, next: NextFunction): any => {
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
