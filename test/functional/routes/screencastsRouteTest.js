// @flow

import path from 'path'
import config from 'config'
import {expect} from 'chai'
import db from 'sequelize-connect'
import app from '../../../source/app'
import supertest from 'supertest-as-promised'
import {describe, it, beforeEach, afterEach} from 'mocha'

describe('"api/screencasts" route', () => {
  beforeEach(async function connectToAndResetTestDatabase () {
    db.logger.level = null // Disable sequelize-connect logging
    db.discover = path.join(__dirname, '../../../source/models')
    db.matcher = function shouldImportModel (modelFileName) {
      return true
    }
    await db.connect(config.database, config.username, config.password, {
      force: true,
      logging: false
    })
  })

  afterEach(function disconnectFromTestDatabase () {
    db.sequelize.close()
  })

  describe('POST request to "api/screencasts"', () => {
    it('should return 401 when Authorization header doesn\'t exist', async () => {
      const {statusCode} = await supertest(app)
        .post('/api/screencasts')
        .send({ url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY' })
      expect(statusCode).to.equal(401)
    })

    it('shouldn\'t save screencast when Authorization header doesn\'t exist', async () => {
      const screencastUrl = 'https://www.youtube.com/watch?v=qsDvJrGMSUY'
      await supertest(app)
        .post('/api/screencasts')
        .send({ url: screencastUrl })
      const screencast = await db.models.screencast.findOne({
        where: {
          url: screencastUrl
        }
      })
      expect(screencast).to.not.exist
    })

    it('should return 401 when Authorization header is invalid', async () => {
      const encodedInvalidPasword = new Buffer('invalid password').toString('base64')
      const authHeader = `Basic: ${encodedInvalidPasword}`
      const {statusCode} = await supertest(app)
        .post('/api/screencasts')
        .set('Authorization', authHeader)
        .send({ url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY' })
      expect(statusCode).to.equal(401)
    })

    it('should return 201 when request is valid', async () => {
      const encodedValidPassword = new Buffer(config.adminPassword).toString('base64')
      const authHeader = `Basic: ${encodedValidPassword}`
      const {statusCode} = await supertest(app)
        .post('/api/screencasts')
        .set('Authorization', authHeader)
        .send({
          url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY',
          tags: 'foo,bar'
        })
      expect(statusCode).to.equal(201)
    })

    it('should save screencast when request is valid', async () => {
      const encodedValidPassword = new Buffer(config.adminPassword).toString('base64')
      const authHeader = `Basic: ${encodedValidPassword}`
      const screencastUrl = 'https://youtu.be/jNQXAC9IVRw'
      await supertest(app)
        .post('/api/screencasts')
        .set('Authorization', authHeader)
        .send({
          url: screencastUrl,
          tags: 'foo,bar'
        })
      const screencast = await db.models.screencast.findOne({
        where: {
          url: screencastUrl
        },
        include: [{
          model: db.models.tag
        }, {
          model: db.models.channel
        }]
      })
      expect(screencast).to.exist
      expect(screencast.dataValues.url).to.equal(screencastUrl)
      expect(screencast.dataValues.id).to.equal('jNQXAC9IVRw')
      expect(screencast.dataValues.title).to.equal('Me at the zoo')
      expect(screencast.dataValues.description).to.match(/^The first video on YouTube/)
      expect(screencast.dataValues.durationInSeconds).to.equal(19)
      expect(screencast.dataValues.tags).to.have.lengthOf(2)
      expect(screencast.dataValues.channel.id).to.equal('UC4QobU6STFB0P71PMvOGN5A')
      expect(screencast.dataValues.channel.name).to.equal('jawed')
    })

    it('should return 400 when url links to a inaccessible YouTube video', async () => {
      const encodedValidPassword = new Buffer(config.adminPassword).toString('base64')
      const authHeader = `Basic: ${encodedValidPassword}`
      const screencastUrl = 'https://www.youtube.com/watch?v=Tx_lyya-Sea'
      const {statusCode, text} = await supertest(app)
        .post('/api/screencasts')
        .set('Authorization', authHeader)
        .send({
          url: screencastUrl,
          tags: 'foo,bar'
        })
      expect(statusCode).to.equal(400)
      const responseBody = JSON.parse(text)
      expect(responseBody.errors).to.have.lengthOf(1)
      expect(responseBody.errors[0].message).to.match(/url must link to/)
    })

    it('should return 409 when url has already been submitted', async() => {
      const encodedValidPassword = new Buffer(config.adminPassword).toString('base64')
      const authHeader = `Basic: ${encodedValidPassword}`
      const screencastUrl = 'https://youtu.be/jNQXAC9IVRw'
      await supertest(app)
        .post('/api/screencasts')
        .set('Authorization', authHeader)
        .send({
          url: screencastUrl,
          tags: 'foo,bar'
        })
      const {statusCode} = await supertest(app)
        .post('/api/screencasts')
        .set('Authorization', authHeader)
        .send({
          url: screencastUrl,
          tags: 'foo,bar'
        })
      expect(statusCode).to.equal(400)
    })

    it('should return 400 when url format is invalid', async () => {
      const encodedValidPassword = new Buffer(config.adminPassword).toString('base64')
      const authHeader = `Basic: ${encodedValidPassword}`
      const {statusCode} = await supertest(app)
        .post('/api/screencasts')
        .set('Authorization', authHeader)
        .send({
          url: 'foo'
        })
      expect(statusCode).to.equal(400)
    })

    it('should return 400 when request body is empty', async () => {
      const encodedValidPassword = new Buffer(config.adminPassword).toString('base64')
      const authHeader = `Basic: ${encodedValidPassword}`
      const {statusCode} = await supertest(app)
        .post('/api/screencasts')
        .set('Authorization', authHeader)
        .send({ })
      expect(statusCode).to.equal(400)
    })
  })

  describe('POST then GET request to "api/screencasts"', () => {
    it('should return correct response', async () => {
      const encodedValidPassword = new Buffer(config.adminPassword).toString('base64')
      const authHeader = `Basic: ${encodedValidPassword}`
      await supertest(app)
        .post('/api/screencasts')
        .set('Authorization', authHeader)
        .send({
          url: 'https://youtu.be/jNQXAC9IVRw',
          tags: 'foo,bar'
        })
      const {statusCode, text} = await supertest(app)
        .get('/api/screencasts')
      expect(statusCode).to.equal(200)
      const responseBody = JSON.parse(text)
      expect(responseBody.hasMore).to.be.false

      const screencast = responseBody.screencasts[0]
      expect(screencast.channel).to.deep.equal({
        id: 'UC4QobU6STFB0P71PMvOGN5A',
        name: 'jawed'
      })
      expect(screencast.id).to.equal('jNQXAC9IVRw')
      expect(screencast.durationInSeconds).to.equal(19)
      expect(screencast.href).to.match(new RegExp(`http://.*/api/screencasts/${screencast.id}$`))
    })
  })

  describe('GET request to "api/screencasts/:screencastId"', () => {
    it('should return 404 if screencast doesn\'t exist', async () => {
      const {statusCode} = await supertest(app)
        .get('/api/screencasts/1')
      expect(statusCode).to.equal(404)
    })

    it('should redirect if screencast does exists', async () => {
      const screencast = require('./screencatsFixture.json')[0]
      await db.models.screencast.createScreencast(screencast)
      const {statusCode, headers} = await supertest(app)
        .get(`/api/screencasts/${screencast.id}`)
      expect(statusCode).to.equal(302)
      expect(headers.location).to.equal(screencast.url)
    })

    it('should increment screencast referral count', async () => {
      const screencast = require('./screencatsFixture.json')[0]
      await db.models.screencast.createScreencast(screencast)
      await supertest(app)
        .get(`/api/screencasts/${screencast.id}`)
      const foundScreencast = await db.models.screencast.findOne({
        where: {
          id: screencast.id
        }
      })
      expect(foundScreencast.dataValues.referralCount).to.equal(1)
    })

    it('should not count view twice', async () => {
      const screencast = require('./screencatsFixture.json')[0]
      await db.models.screencast.createScreencast(screencast)
      await supertest(app)
        .get(`/api/screencasts/${screencast.id}`)
      await supertest(app)
        .get(`/api/screencasts/${screencast.id}`)
      const foundScreencast = await db.models.screencast.findOne({
        where: {
          id: screencast.id
        }
      })
      expect(foundScreencast.dataValues.referralCount).to.equal(1)
    })
  })

  describe('GET request to "api/screencasts"', () => {
    beforeEach(async () => {
      config.screencastsPerPage = 2
      const screencasts = require('./screencatsFixture.json')
      for (const screencast of screencasts) {
        await db.models.screencast.createScreencast(screencast)
      }
    })

    it('should return correct screencasts for page 1', async () => {
      const foo = supertest(app)
      const {text} = await foo.get('/api/screencasts')
      const responseBody = JSON.parse(text)
      expect(responseBody.screencasts).to.have.lengthOf(config.screencastsPerPage)
      expect(responseBody.hasMore).to.be.true
    })

    it('should return correct screencasts for page 2', async () => {
      const foo = supertest(app)
      const {text} = await foo.get('/api/screencasts?page=2')
      const responseBody = JSON.parse(text)
      expect(responseBody.screencasts).to.have.lengthOf(config.screencastsPerPage)
      expect(responseBody.hasMore).to.be.true
    })

    it('should return correct screencasts for page 3', async () => {
      const foo = supertest(app)
      const {text} = await foo.get('/api/screencasts?page=3')
      const responseBody = JSON.parse(text)
      expect(responseBody.screencasts).to.have.lengthOf(1)
      expect(responseBody.hasMore).to.be.false
    })
  })
})
