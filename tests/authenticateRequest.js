// @flow

import test from 'ava'
import sinon from 'sinon'
import httpMocks from "node-mocks-http";
import mockery from 'mockery'

const adminPassword = 'some password'

test.before(() => {
  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false
  });
  mockery.registerMock('config', {
    adminPassword
  })
})

test('authenticateRequest returns a function', t => {
  const authenticateRequest = 
    require('../source/middleware/authenticateRequest').default

  t.ok(typeof authenticateRequest === 'function')
})

test('authenticateRequest with invalid password returns 401', t => {
  const authenticateRequest = 
    require('../source/middleware/authenticateRequest').default
  const encodedPassword = new Buffer('invalid password').toString('base64')
  const req = httpMocks.createRequest({
    headers: {
      authorization: `Basic: ${encodedPassword}`
    }
  })
  const res = httpMocks.createResponse()
  const next = sinon.spy()

  authenticateRequest(req, res, next)

  t.ok(res.statusCode === 401)
  t.ok(next.called === false)
})

test('authenticateRequest with valid password calls next middleware', t => {
  const authenticateRequest = 
    require('../source/middleware/authenticateRequest').default
  const encodedPassword = new Buffer(adminPassword).toString('base64')
  const req = httpMocks.createRequest({
    headers: {
      authorization: `Basic: ${encodedPassword}`
    }
  })
  const res = httpMocks.createResponse()
  const next = sinon.spy()

  authenticateRequest(req, res, next)

  t.ok(next.called === true)
})

test('authenticateRequest without authorization header returns 401', t => {
  const authenticateRequest = 
    require('../source/middleware/authenticateRequest').default
  const req = httpMocks.createRequest()
  const res = httpMocks.createResponse()

  authenticateRequest(req, res)

  t.ok(res.statusCode === 401)
})

test('authenticateRequest with malformed authorization header returns 401 ', t => {
  const authenticateRequest = 
    require('../source/middleware/authenticateRequest').default
  const req = httpMocks.createRequest({
    headers: {
      authorization: 'Basic: dsfs'
    }
  })
  const res = httpMocks.createResponse()
  const next = sinon.spy()

  authenticateRequest(req, res, next)

  t.ok(res.statusCode === 401)
  t.ok(next.called === false)
})
