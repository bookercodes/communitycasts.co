// @flow

import {expect} from 'chai'
import {suite, test} from 'mocha';
import validator from '../source/middleware/validateScreencastInput.js'
import sinon from 'sinon'
import httpMocks from "node-mocks-http";
import mockery from 'mockery'

suite('validateScreencastInput', () => {

  test('should export a function', () => {
    expect(validator).to.be.a('function')
  })

  test('should call next middleware function when input is valid', () => {
    const req = httpMocks.createRequest({
      body: {
        url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY'
      }
    })
    const res = httpMocks.createResponse()
    const next = sinon.spy()

    validator(req, res, next)

    expect(next.called).to.equal(true)
  })

  test('should send 400 when request body is missing', () => {
    const req = httpMocks.createRequest({
    })
    const res = httpMocks.createResponse()
    const next = sinon.spy()

    validator(req, res, next)

    expect(res.statusCode).to.equal(400)
    const resBody = res._getData()
    expect(resBody).to.equal('Request body is missing')
    expect(next.called).to.equal(false)
  })

  test('should send 400 when url is invalid', () => {
    const req = httpMocks.createRequest({
      body: {
        url: 'foo'
      }
    })
    const res = httpMocks.createResponse()
    const next = sinon.spy()

    validator(req, res, next)

    expect(res.statusCode).to.equal(400)
    const resBody = res._getData()
    expect(resBody).to.equal('Url is invalid')
    expect(next.called).to.equal(false)
  })
})
