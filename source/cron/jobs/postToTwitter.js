// @flow

import config from 'config'
import db from 'sequelize-connect'
import Twit from 'twit'

async function findScreencast () {
  const screencast = await db.models.screencast.findOne({
    where: {
      id: {
        $notIn:
          db.sequelize.literal('(SELECT screencastId FROM socialNetworkPosts)')
      }
    }
  })
  return screencast
}

async function save (screencastId) {
  await db.models.socialNetworkPost.create({
    screencastId
  })
}

async function tweet (status) {
  const twitter = new Twit({
    consumer_key: config.get('twitter.consumer_key'),
    consumer_secret: config.get('twitter.consumer_secret'),
    access_token: config.get('twitter.access_token_key'),
    access_token_secret: config.get('twitter.access_token_secret')
  })
  await twitter.post('statuses/update', { status })
}

export const postToTwitter = async function () {
  const screencast = await findScreencast()
  if (screencast === null) {
    throw new Error('couldn\'t find a screencast to post')
  } else {
    const status = `${screencast.title}🔽\r\n${screencast.url}`
    await tweet(status)
    await save(screencast.id)
  }
}
