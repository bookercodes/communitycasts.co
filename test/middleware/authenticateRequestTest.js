// @flow

import {expect} from 'chai'
import {suite, test, suiteSetup, setup, teardown, suiteTeardown} from 'mocha';
import sinon from 'sinon'
import httpMocks from "node-mocks-http";
import mockery from 'mockery'

suite('authenticateRequest', () => {

  const adminPassword = 'some password'

  suiteSetup(() => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });
    mockery.registerMock('config', {
      adminPassword
    })
  })

  test('authenticateRequest returns a function', () => {
    const authenticateRequest =
      require('../../source/middleware/authenticateRequest').default

    expect(authenticateRequest).to.be.a('function')
  })

  test('authenticateRequest with invalid password returns 401', () => {
    const authenticateRequest =
      require('../../source/middleware/authenticateRequest').default
    const encodedPassword = new Buffer('invalid password').toString('base64')
    const req = httpMocks.createRequest({
      headers: {
        authorization: `Basic: ${encodedPassword}`
      }
    })
    const res = httpMocks.createResponse()
    const next = sinon.spy()

    authenticateRequest(req, res, next)

    expect(res.statusCode).to.equal(401)
    const resBody = res._getData()
    expect(resBody).to.equal('Invalid password')
    expect(next.called).to.equal(false)
  })

  test('authenticateRequest with valid password calls next middleware', () => {
    const authenticateRequest =
      require('../../source/middleware/authenticateRequest').default
    const encodedPassword = new Buffer(adminPassword).toString('base64')
    const req = httpMocks.createRequest({
      headers: {
        authorization: `Basic: ${encodedPassword}`
      }
    })
    const res = httpMocks.createResponse()
    const next = sinon.spy()

    authenticateRequest(req, res, next)

    expect(next.called).to.be.true
  })

  test('authenticateRequest without authorization header returns 401', () => {
    const authenticateRequest =
      require('../../source/middleware/authenticateRequest').default
    const req = httpMocks.createRequest()
    const res = httpMocks.createResponse()

    authenticateRequest(req, res)

    expect(res.statusCode).to.equal(401)
    const resBody = res._getData()
    expect(resBody).to.equal('Authorization header missing')
  })

  test('authenticateRequest with malformed authorization header returns 401 ', () => {
    const authenticateRequest =
      require('../../source/middleware/authenticateRequest').default
    const req = httpMocks.createRequest({
      headers: {
        authorization: 'Basic: '
      }
    })
    const res = httpMocks.createResponse()
    const next = sinon.spy()

    authenticateRequest(req, res, next)
    expect(res.statusCode).to.equal(401)
    const resBody = res._getData()
    expect(resBody).to.equal('Invalid Authorization header')
    expect(next.called).to.equal(false)
  })
})
