import {describe, it, beforeEach} from 'mocha'
import db from 'sequelize-connect'
import path from 'path'
import {expect} from 'chai'
import config from 'config'
import postToTwitter from '../../../../source/cron/jobs/postToTwitter'

describe('postToTwitter', () => {
  beforeEach(function connectToAndResetTestDatabase () {
    db.logger.level = null // Disable sequelize-connect logging
    db.discover = path.join(__dirname, '../../../../source/models')
    db.matcher = function shouldImportModel (modelFileName) {
      return true
    }
    return db.connect(config.database, config.username, config.password, {
      force: true,
      logging: false
    })
  })

  it('empty db', async () => {
    await postToTwitter()
    const foundPosts = await db.models.socialNetworkPost.findAll()
    expect(foundPosts).to.be.empty
  })

  it.only('tweet', async () => {
    const screencasts = require('../../../functional/routes/screencatsFixture.json')
    await db.models.screencast.createScreencast(screencasts[0])
    await postToTwitter()
  })

  it('tweet already in db', async () => {
  })
})
