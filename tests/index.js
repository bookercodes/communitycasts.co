// @flow

import db from 'sequelize-connect'
import test from 'ava'
import path from 'path'
import request from 'supertest-as-promised'
import server from '../source'
import config from '../source/config/config.json'

test.before(function initializeDb() {
  db.matcher = () => true
  db.discover = [path.join(__dirname, '../source/models')]
  const { database, username, password } = config.test
  return db.connect(database, username, password, {
    force: true
  })
})

test('POST to /api/screencasts with valid screencast should return status 201', async t => {
  const response = await request(server)
    .post('/api/screencasts')
    .send({
      url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY'
    })
  const actual = response.statusCode

  t.true(actual === 201)
})

test('POST to /api/screencasts with valid screencast should store screencast in db', async t => {
  const screencastUrl = 'https://www.youtube.com/watch?v=qsDvJrGMSUY'
  await request(server)
    .post('/api/screencasts')
    .send({
      url: screencastUrl
    })
  const actual = await db.models.Screencast.findOne({
    where: {
      url: screencastUrl
    }
  })

  t.true(actual !== null)
})
