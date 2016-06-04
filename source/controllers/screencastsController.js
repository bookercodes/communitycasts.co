// @flow

import db from 'sequelize-connect'
import config from 'config'
import * as youtubeClient from '../util/youtubeClient.js'
import * as modelMapper from '../util/modelMapper'

export async function handlePost (req: Request, res: Response, next: NextFunction): any {
  const client = youtubeClient.create(config.youtubeApiKey)
  const screencast = await client.fetchVideoDetails(req.body.url)
  if (!screencast) {
    next(`Could not find video at ${req.body.url}.`)
  } else {
    await db.models.screencast.createScreencast({
      id: screencast.id,
      title: screencast.title,
      description: screencast.description,
      durationInSeconds: screencast.durationInSeconds,
      channel: screencast.channel,
      url: req.body.url,
      tags: modelMapper.mapTags(req.body.tags)
    })
    res.sendStatus(201)
  }
}

export async function handleGet (req: Request, res: Response): any {
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
}

export async function sendScreencast (req: Request, res: Response, next: NextFunction): any {
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
}
