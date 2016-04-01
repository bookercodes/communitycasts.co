// @flow
process.cwd(process.env.NODE_CONFIG_DIR);

import db from 'sequelize-connect'
import test from 'ava'
import path from 'path'
import request from 'supertest-as-promised'
import server from '../source/server'
import config from 'config'

test.beforeEach(function connectToAndResetTestDatabase() {
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

test('POST without authorization header should return 401', async t => {
  const {statusCode} = await request(server)
    .post('/api/screencasts')
    .send({
      url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY'
    })

  t.true(statusCode === 401)
})

test('POST without Authorization header shouldn\'t save screencast', async t => {
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

  t.true(screencast === null)
})

test('POST with invalid credentails should return 401', async t => {
  const password = 'invalid password'
  const encodedPassword = new Buffer(password).toString('base64')
  const authHeader = `Basic: ${encodedPassword}`
  const {statusCode} = await request(server)
    .post('/api/screencasts')
    .set('Authorization', authHeader)
    .send({
      url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY'
    })

  t.true(statusCode === 401)
}) 

test('Valid POST should return 201', async t => {
  const password = config.adminPassword
  const encodedPassword = new Buffer(password).toString('base64')
  const authHeader = `Basic: ${encodedPassword}`
  const {statusCode} = await request(server)
    .post('/api/screencasts')
    .set('Authorization', authHeader)
    .send({
      url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY'
    })

  t.true(statusCode === 201)
}) 

test.only('Valid POST should save screencast', async t => {
  const password = config.adminPassword
  const encodedPassword = new Buffer(password).toString('base64')
  const authHeader = `Basic: ${encodedPassword}`
  const screencastUrl = 'https://www.youtube.com/watch?v=qsDvJrGMSUY'
  await request(server)
    .post('/api/screencasts')
    .set('Authorization', authHeader)
    .send({
      url: screencastUrl
    })
  const screencast = await db.models.Screencast.findOne({
    where: {
      url: screencastUrl
    }
  })

  t.true(screencast !== null)
})
