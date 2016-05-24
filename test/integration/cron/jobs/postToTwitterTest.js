// @flow

import {describe, it, beforeEach} from 'mocha'
import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import config from 'config'
import db from 'sequelize-connect'
import path from 'path'
import proxyquire from 'proxyquire'
import sinon from 'sinon'

chai.use(chaiAsPromised)

describe('postToTwitter', () => {
  beforeEach(async function connectToAndResetTestDatabase () {
    db.logger.level = null // Disable sequelize-connect logging
    db.discover = path.join(__dirname, '../../../../source/models')
    db.matcher = function shouldImportModel (modelFileName) {
      return true
    }
    await db.connect(config.database, config.username, config.password, {
      force: true,
      logging: false
    })
  })

  it('should throw when db is empty', async () => {
    const sut = require('../../../../source/cron/jobs/postToTwitter').default
    return expect(sut())
      .to
      .be
      .rejected
  })

  it('should Tweet any screencast from db', async () => {
    const postSpy = sinon.spy()
    function TwitMock () {
      return {
        post: postSpy
      }
    }
    const sut = proxyquire('../../../../source/cron/jobs/postToTwitter', {
      'twit': TwitMock
    }).default
    const screencast =
      require('../../../functional/routes/screencatsFixture.json')[0]
    await db.models.screencast.createScreencast(screencast)
    await sut()
    expect(postSpy.called)
      .to
      .be
      .true
  })

  it('should not Tweet same screencast more than once', async () => {
    function TwitMock () {
      return { post: function postDummy () { } }
    }
    const sut = proxyquire('../../../../source/cron/jobs/postToTwitter', {
      'twit': TwitMock
    }).default
    const screencast =
      require('../../../functional/routes/screencatsFixture.json')[0]
    await db.models.screencast.createScreencast(screencast)
    await sut()
    return expect(sut())
      .to
      .be
      .rejected
  })
})
