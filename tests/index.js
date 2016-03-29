// @flow

import test from 'ava'
import request from 'supertest-as-promised'
import server from '../source'

test(async t => {
  await request(server)
    .get('/')
    .expect(200)
})
