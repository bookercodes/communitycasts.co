// @flow

import app from '../source/app.js'
import request from 'supertest-as-promised'
import {expect} from 'chai'
import {suite, test, setup} from 'mocha';

suite('app', function() {
  test('returns 500 and error when error occurs', async () => {
    const route = '/foo_bar'
    const err = new Error('some err')
    app.get(route, (req, res, next) => {
      next(err)
    })
    const res = await request(app).get(route)
    expect(res.statusCode).to.equal(500)
    expect(res.text).to.match(/some err/)
  })
})
