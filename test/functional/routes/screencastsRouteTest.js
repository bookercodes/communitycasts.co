// @flow

import path from 'path'
import moment from 'moment'
import config from 'config'
import {expect} from 'chai'
import db from 'sequelize-connect'
import app from '../../../source/app'
import supertest from 'supertest-as-promised'
import {describe, it, beforeEach, afterEach} from 'mocha'
import testScreencasts from '../../util/fixtures/testScreencasts.json'

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
      const screencastId = 'jNQXAC9IVRw'
      await supertest(app)
        .post('/api/screencasts')
        .set('Authorization', authHeader)
        .send({
          url: `https://youtu.be/${screencastId}`,
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
      expect(screencast.durationInSeconds).to.equal(19)
      expect(screencast.href).to.match(new RegExp(`http://.*/api/screencasts/${screencastId}$`))
    })
  })

  describe('GET request to "api/screencasts/:screencastId"', () => {
    it('should return 404 if screencast doesn\'t exist', async () => {
      const {statusCode} = await supertest(app)
        .get('/api/screencasts/1')
      expect(statusCode).to.equal(404)
    })

    it('should redirect if screencast does exists', async () => {
      const screencast = testScreencasts[0]
      await db.models.screencast.createScreencast(screencast)
      const {statusCode, headers} = await supertest(app)
        .get(`/api/screencasts/${screencast.id}`)
      expect(statusCode).to.equal(302)
      expect(headers.location).to.equal(screencast.url)
    })

    it('should increment screencast referral count', async () => {
      const screencast = testScreencasts[0]
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
      const screencast = testScreencasts[0]
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

  describe('GET request to "api/screencasts" with the "popular" sort option', () => {
    it('should return screencasts sorted by their popularity (descending)', async () => {
      const unpopularScreencast = {
        ...testScreencasts[1],
        // this screencast was submitted so long ago it is no longer 'popular'
        createdAt: moment().subtract(5, 'months'),
        referralCount: 5
      }
      const popularScreencast = {
        ...testScreencasts[0],
        createdAt: moment(),
        referralCount: 1
      }
      await db.models.screencast.createScreencast(unpopularScreencast)
      await db.models.screencast.createScreencast(popularScreencast)

      const {text} = await supertest(app).get('/api/screencasts?sort=popular')
      const responseBody = JSON.parse(text)

      expect(
        responseBody.screencasts[0].title,
        'expected popularScreencast to be first').to.equal(popularScreencast.title)
      expect(
          responseBody.screencasts[1].title,
         'expected unpopularScreencast to be second').to.equal(unpopularScreencast.title)
    })
    it('should return screencasts sorted by their popularity (descending)', async () => {
      const unpopularScreencast = {
        ...testScreencasts[1],
        // this screencast was submitted so long ago it is no longer 'popular'
        createdAt: moment().subtract(1, 'month'),
        referralCount: 100
      }
      const popularScreencast = {
        ...testScreencasts[0],
        createdAt: moment(),
        referralCount: 50
      }
      await db.models.screencast.createScreencast(unpopularScreencast)
      await db.models.screencast.createScreencast(popularScreencast)

      const {text} = await supertest(app).get('/api/screencasts?sort=popular')
      const responseBody = JSON.parse(text)

      expect(
        responseBody.screencasts[0].title,
        'expected popularScreencast to be first').to.equal(popularScreencast.title)
      expect(
          responseBody.screencasts[1].title,
         'expected unpopularScreencast to be second').to.equal(unpopularScreencast.title)
    })

    it('should return screencasts sorted by their popularity (descending)', async () => {
      const unpopularScreencast = {
        ...testScreencasts[0],
        createdAt: moment(),
        referralCount: 50
      }
      const popularScreencast = {
        ...testScreencasts[1],
        // despite being created one hour ago, this screencast is still more
        //  popular
        createdAt: moment().subtract(1, 'hour'),
        referralCount: 100
      }
    await db.models.screencast.createScreencast(unpopularScreencast)
      await db.models.screencast.createScreencast(popularScreencast)

      const {text} = await supertest(app).get('/api/screencasts?sort=popular')
      const responseBody = JSON.parse(text)

      expect(
        responseBody.screencasts[0].title,
        'expected popularScreencast to be first').to.equal(popularScreencast.title)
      expect(
          responseBody.screencasts[1].title,
         'expected unpopularScreencast to be second').to.equal(unpopularScreencast.title)
    })

    it('should return correct results for page 1', async () => {
      config.screencastsPerPage = 1
      const unpopularScreencast = {
        ...testScreencasts[0],
        createdAt: moment(),
        referralCount: 50
      }
      const popularScreencast = {
        ...testScreencasts[1],
        // despite being created one hour ago, this screencast is still more
        //  popular
        createdAt: moment().subtract(1, 'hour'),
        referralCount: 100
      }
      await db.models.screencast.createScreencast(unpopularScreencast)
      await db.models.screencast.createScreencast(popularScreencast)

      const {text} = await supertest(app).get('/api/screencasts?page=1&sort=popular')
      const responseBody = JSON.parse(text)
      expect(
        responseBody.screencasts[0].title,
        'expected popularScreencast to be first').to.equal(popularScreencast.title)
    })

    it('should return correct results for page 2', async () => {
      config.screencastsPerPage = 1
      const unpopularScreencast = {
        ...testScreencasts[0],
        createdAt: moment(),
        referralCount: 50
      }
      const popularScreencast = {
        ...testScreencasts[1],
        // despite being created one hour ago, this screencast is still more
        //  popular
        createdAt: moment().subtract(1, 'hour'),
        referralCount: 100
      }
      await db.models.screencast.createScreencast(unpopularScreencast)
      await db.models.screencast.createScreencast(popularScreencast)

      const {text} = await supertest(app).get('/api/screencasts?page=2&sort=popular')
      const responseBody = JSON.parse(text)
      expect(
        responseBody.screencasts[0].title,
        'expected unpopularScreencast to be second').to.equal(unpopularScreencast.title)
    })
  })

  describe('GET request to "api/screencasts"', () => {
    beforeEach(async function createTestScreencasts () {
      let createdAt = moment()
      for (const screencast of testScreencasts) {
        screencast.createdAt = createdAt.toDate()
        // Add one minute between submissions so we can test that screencasts
        //  are sorted by their creation date
        createdAt.add(1, 'minute')
        await db.models.screencast.createScreencast(screencast)
      }
    })

    it('should return screencasts sorted by their creation date (descending) by default', async () => {
      config.screencastsPerPage = testScreencasts.length
      const {text} = await supertest(app).get('/api/screencasts')
      const responseBody = JSON.parse(text)
      const selectTitle = screencast => screencast.title
      const expected = testScreencasts.map(selectTitle).reverse()
      const actual = responseBody.screencasts.map(selectTitle)
      expect(actual).to.deep.equal(expected)
    })

    it('should return correct screencasts for page 1', async () => {
      config.screencastsPerPage = 2
      const {text} = await supertest(app).get('/api/screencasts')
      const responseBody = JSON.parse(text)
      expect(responseBody.screencasts).to.have.lengthOf(config.screencastsPerPage)
      expect(responseBody.hasMore).to.be.true
    })

    it('should return correct screencasts for page 2', async () => {
      config.screencastsPerPage = 2
      const {text} = await supertest(app).get('/api/screencasts')
      const responseBody = JSON.parse(text)
      expect(responseBody.screencasts).to.have.lengthOf(config.screencastsPerPage)
      expect(responseBody.hasMore).to.be.true
    })

    it('should return correct screencasts for page 3', async () => {
      config.screencastsPerPage = 2
      const {text} = await supertest(app).get('/api/screencasts?page=3')
      const responseBody = JSON.parse(text)
      expect(responseBody.screencasts).to.have.lengthOf(1)
      expect(responseBody.hasMore).to.be.false
    })
  })
})
