// @flow

import db from 'sequelize-connect'
import {expect} from 'chai'
import {suite, test, setup} from 'mocha';
import path from 'path'
import request from 'supertest-as-promised'
import server from '../source/server'
import config from 'config'

suite('index', () => {

  setup(function connectToAndResetTestDatabase() {
    db.logger.level = null
    db.discover = [path.join(__dirname, '../source/models')]
    db.matcher = function shouldImportModel(modelFileName) {
      return true
    }
    return db.connect(config.database, config.username, config.password, {
      force: true,
      logging: false
    })
  })

  test('POST without authorization header should return 401', async () => {
    const {statusCode} = await request(server)
    .post('/api/screencasts')
    .send({
      url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY'
    })

    expect(statusCode).to.equal(401)
  })

  test('POST without Authorization header shouldn\'t save screencast', async () => {
    const screencastUrl = 'https://www.youtube.com/watch?v=abc'
    await request(server)
      .post('/api/screencasts')
      .send({
        url: screencastUrl
      })
    const screencast = await db.models.Screencast.findOne({
      where: {
        url: screencastUrl
      }
    })

    expect(screencast).to.not.exist
  })

  test('POST with invalid credentails should return 401', async () => {
    const password = 'invalid password'
    const encodedPassword = new Buffer(password).toString('base64')
    const authHeader = `Basic: ${encodedPassword}`
    const {statusCode} = await request(server)
      .post('/api/screencasts')
      .set('Authorization', authHeader)
      .send({
        url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY'
      })

    expect(statusCode).to.equal(401)
  })

  test('Valid POST should return 201', async () => {
    const password = config.adminPassword
    const encodedPassword = new Buffer(password).toString('base64')
    const authHeader = `Basic: ${encodedPassword}`
    const {statusCode} = await request(server)
      .post('/api/screencasts')
      .set('Authorization', authHeader)
      .send({
        url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY'
      })

    expect(statusCode).to.equal(201)
  })

  test('', async() => {
    const password = config.adminPassword
    const encodedPassword = new Buffer(password).toString('base64')
    const authHeader = `Basic: ${encodedPassword}`
    const screencastUrl = 'https://youtu.be/jNQXAC9IVRw'
    await request(server)
      .post('/api/screencasts')
      .set('Authorization', authHeader)
      .send({
        url: screencastUrl
      })
    const result = await request(server)
      .post('/api/screencasts')
      .set('Authorization', authHeader)
      .send({
        url: screencastUrl
      })
    expect(result.statusCode).to.equal(409)
  })

  test('Valid POST should save screencast', async () => {
    const password = config.adminPassword
    const encodedPassword = new Buffer(password).toString('base64')
    const authHeader = `Basic: ${encodedPassword}`
    const screencastUrl = 'https://youtu.be/jNQXAC9IVRw'
    await request(server)
      .post('/api/screencasts')
      .set('Authorization', authHeader)
      .send({
        url: screencastUrl
      })
    const result = await db.models.Screencast.findOne({
      where: {
        url: screencastUrl
      }
    })

    expect(result).to.exist
    const screencast = result.dataValues
    expect(screencast.url).to.equal(screencastUrl)
    expect(screencast.id).to.equal('jNQXAC9IVRw')
    expect(screencast.title).to.equal('Me at the zoo')
    expect(screencast.description).to.match(/^The first video on YouTube/)
    expect(screencast.durationInSeconds).to.equal(19)
  })
})
