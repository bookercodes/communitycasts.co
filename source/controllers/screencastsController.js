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
      req.query.page,
      req.query.sort)
    result.screencasts = result.screencasts.map(screencast => {
      screencast = screencast.dataValues
      return {
        href: `${req.protocol}://${req.headers.host}/api/screencasts/${screencast.id}`,
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

screencastsController.sendScreencast = async (req: Request, res: Response, next: NextFunction): any => {
  try {
    const foundScreencast = await db.models.screencast.findOne({
      where: {
        id: req.params.screencastId
      }
    })
    if (foundScreencast === null) {
      res.sendStatus(404)
    } else {
      const foundReferral = await db.models.referral.findOne({
        where: {
          screencastId: req.params.screencastId,
          refereeIp: req.ip
        }
      })
      if (foundReferral === null) {
        await foundScreencast.increment({
          referralCount: 1
        })
        await db.models.referral.create({
          screencastId: req.params.screencastId,
          refereeIp: req.ip
        })
      }
      res.redirect(foundScreencast.dataValues.url)
    }
  } catch (err) {
    console.log(err)
    next(err)
  }
}

export default screencastsController
