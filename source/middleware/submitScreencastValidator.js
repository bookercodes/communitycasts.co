// @flow

import config from 'config'
import youtubeUrl from 'youtube-url'
import db from 'sequelize-connect'
import * as youtubeClient from '../../source/util/youtubeClient'

async function validateUrl (url: string): Promise<string> {
  if (!url) {
    return 'url cannot be undefined'
  }

  if (!youtubeUrl.valid(url)) {
    return 'url must be a valid YouTube URL'
  }

  const client = youtubeClient.create(config.youtubeApiKey)
  if (!await client.videoExists(url)) {
    return 'url must link to an existent, public YouTube video'
  }

  const foundScreencast = await db.models.screencast.findOne({
    where: {
      url: url
    }
  })
  if (foundScreencast !== null) {
    return 'url has already been submitted'
  }

  return undefined
}

function validateTags (tags) {
  if (!tags) {
    return 'tags cannot be undefined'
  }

  if (typeof tags !== 'string') {
    return 'tags must be a string'
  }

  if (/[a-zA-Z]/g.exec(tags) === null) {
    return 'there must be at least one tag'
  }
}

export async function validateSubmitScreencastReq (req: any, res:any, next:any): any {
  try {
    const urlError = await validateUrl(req.body.url)
    const tagError = validateTags(req.body.tags)
    const errors = []
    if (urlError) {
      errors.push({
        field: 'url',
        message: urlError
      })
    }
    if (tagError) {
      errors.push({
        field: 'tags',
        message: tagError
      })
    }
    if (errors.length !== 0) {
      res.status(400).json({errors})
    } else {
      next()
    }
  } catch (error) {
    next(error)
  }
}
