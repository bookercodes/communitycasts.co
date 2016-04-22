// @flow

import {expect} from 'chai'
import {describe, it} from 'mocha'
import request from 'supertest-as-promised'
import app from '../source/app.js'

describe('app', () => {
  it('should export a function', () => {
    expect(app).to.be.a('function')
  })

  it('should return 500 when unhandled error occurs', async () => {
    const route = '/foo'
    const error = new Error('foo')
    app.get(route, ({next}) => next(error))

    const res: any = await request(app).get(route)

    expect(res.statusCode).to.equal(500)
    expect(res.text).to.contain(error.message)
  })
})
