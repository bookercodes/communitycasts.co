// @flow

import path from 'path'
import config from 'config'
import {expect} from 'chai'
import db from 'sequelize-connect'
import app from '../../../source/app'
import supertest from 'supertest-as-promised'
import {describe, it, beforeEach} from 'mocha'

describe('screencasts route', () => {
  beforeEach(function connectToAndResetTestDatabase () {
    db.logger.level = null // Disable sequelize-connect logging
    db.discover = path.join(__dirname, '../../../source/models')
    db.matcher = function shouldImportModel (modelFileName) {
      return true
    }
    return db.connect(config.database, config.username, config.password, {
      force: true,
      logging: false
    })
  })

  it('should return 401 when POST request doesn\'t have an Authorization header', async () => {
    const {statusCode} = await supertest(app)
      .post('/api/screencasts')
      .send({ url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY' })

    expect(statusCode).to.equal(401)
  })

  it('shouldn\'t save screencast when POST request doesn\'t have an Authorization header', async () => {
    const screencastUrl = 'https://www.youtube.com/watch?v=qsDvJrGMSUY'
    await supertest(app)
      .post('/api/screencasts')
      .send({ url: screencastUrl })

    const screencast = await db.models.Screencast.findOne({
      where: {
        url: screencastUrl
      }
    })

    expect(screencast).to.not.exist
  })

  it('should return 401 when POST request has an invalid Authorization header', async () => {
    const encodedPassword = new Buffer('invalid password').toString('base64')
    const authHeader = `Basic: ${encodedPassword}`
    const {statusCode} = await supertest(app)
      .post('/api/screencasts')
      .set('Authorization', authHeader)
      .send({ url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY' })

    expect(statusCode).to.equal(401)
  })

  it('should return 201 when POST request is valid', async () => {
    const password = config.adminPassword
    const encodedPassword = new Buffer(password).toString('base64')
    const authHeader = `Basic: ${encodedPassword}`
    const {statusCode} = await supertest(app)
      .post('/api/screencasts')
      .set('Authorization', authHeader)
      .send({
        url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY',
        tags: 'foo,bar'
      })

    expect(statusCode).to.equal(201)
  })

  it('should save screencast when POST request is valid', async () => {
    const password = config.adminPassword
    const encodedPassword = new Buffer(password).toString('base64')
    const authHeader = `Basic: ${encodedPassword}`
    const screencastUrl = 'https://youtu.be/jNQXAC9IVRw'
    await supertest(app)
      .post('/api/screencasts')
      .set('Authorization', authHeader)
      .send({
        url: screencastUrl,
        tags: 'foo,bar'
      })
    const screencast = await db.models.Screencast.findOne({
      where: {
        url: screencastUrl
      },
      include: [{
        model: db.models.Tag
      }]
    })

    expect(screencast).to.exist
    expect(screencast.dataValues.url).to.equal(screencastUrl)
    expect(screencast.dataValues.id).to.equal('jNQXAC9IVRw')
    expect(screencast.dataValues.title).to.equal('Me at the zoo')
    expect(screencast.dataValues.description).to.match(/^The first video on YouTube/)
    expect(screencast.dataValues.durationInSeconds).to.equal(19)
    expect(screencast.dataValues.Tags).to.have.lengthOf(2)
  })

  it('should return 400 when url links to a non-existent/non-accessible YouTube video', async () => {
    const password = config.adminPassword
    const encodedPassword = new Buffer(password).toString('base64')
    const authHeader = `Basic: ${encodedPassword}`
    const screencastUrl = 'https://www.youtube.com/watch?v=Tx_lyya-Sea'
    const res = await supertest(app)
      .post('/api/screencasts')
      .set('Authorization', authHeader)
      .send({
        url: screencastUrl,
        tags: 'foo,bar'
      })

    expect(res.statusCode).to.equal(400)
    const response = JSON.parse(res.text)
    expect(response.errors).to.have.lengthOf(1)
    expect(response.errors[0].message).to.match(/url must link to/)
  })

  it('should return 409 when url has already been submitted', async() => {
    const password = config.adminPassword
    const encodedPassword = new Buffer(password).toString('base64')
    const authHeader = `Basic: ${encodedPassword}`
    const screencastUrl = 'https://youtu.be/jNQXAC9IVRw'
    await supertest(app)
      .post('/api/screencasts')
      .set('Authorization', authHeader)
      .send({
        url: screencastUrl,
        tags: 'foo,bar'
      })
    const result = await supertest(app)
      .post('/api/screencasts')
      .set('Authorization', authHeader)
      .send({
        url: screencastUrl,
        tags: 'foo,bar'
      })
    expect(result.statusCode).to.equal(400)
  })

  it('should return 400 when url format is invalid', async () => {
    const password = config.adminPassword
    const encodedPassword = new Buffer(password).toString('base64')
    const authHeader = `Basic: ${encodedPassword}`
    const {statusCode} = await supertest(app)
      .post('/api/screencasts')
      .set('Authorization', authHeader)
      .send({
        url: 'foo'
      })

    expect(statusCode).to.equal(400)
  })

  it('should return 400 when POST request body is empty', async () => {
    const password = config.adminPassword
    const encodedPassword = new Buffer(password).toString('base64')
    const authHeader = `Basic: ${encodedPassword}`
    const {statusCode} = await supertest(app)
      .post('/api/screencasts')
      .set('Authorization', authHeader)
      .send({ })

    expect(statusCode).to.equal(400)
  })
})
