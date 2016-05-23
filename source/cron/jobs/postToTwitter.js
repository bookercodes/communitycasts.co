import db from 'sequelize-connect'
import config from 'config'
import Twitter from 'twitter'

export default async function postToTwitter () {
  const {dataValues: foundScreencast} = await db.models.screencast.findOne({
    where: {
      id: { $notIn: db.sequelize.literal('(SELECT screencastId FROM socialNetworkPosts)') }
    }
  })
  if (foundScreencast === null) {
    // screencast not found... boo hoo
  } else {
    var client = new Twitter({
      consumer_key: config.get('twitter.consumer_key'),
      consumer_secret: config.get('twitter.consumer_secret'),
      access_token_key: config.get('twitter.access_token_key'),
      access_token_secret: config.get('twitter.access_token_secret')
    })
    return new Promise((resolve, reject) => {
      const status = `${foundScreencast.title}🔽\r\n${foundScreencast.url}`
      client.post('statuses/update', {status}, (error, tweet, response) => {
        if (error) return reject(error)
        resolve(response)
      })
    })
  }
}
