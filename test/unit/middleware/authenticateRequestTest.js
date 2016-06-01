// @flow

import {expect} from 'chai'
import {describe, it} from 'mocha'
import sinon from 'sinon'
import httpMocks from 'node-mocks-http'
import config from 'config'

function encodePassword (password: string): string {
  return new Buffer(password).toString('base64')
}

describe('authenticateRequest', () => {
  it('exports a function', () => {
    const {authenticateRequest} = require('../../../source/middleware/authenticateRequest')
    expect(authenticateRequest).to.be.a('function')
  })

  it('returns 401 when password is invalid', () => {
    const {authenticateRequest} = require('../../../source/middleware/authenticateRequest')
    const reqMock = httpMocks.createRequest({
      headers: { authorization: `Basic: ${encodePassword('invalid password')}` }
    })
    const resMock = httpMocks.createResponse()
    const nextSpy = sinon.spy()

    authenticateRequest(reqMock, resMock, nextSpy)

    expect(resMock.statusCode).to.equal(401)
    const {errors} = JSON.parse(resMock._getData())
    const expected = [{ message: 'Invalid password' }]
    expect(errors).to.deep.equal(expected)
    expect(nextSpy.called).to.be.false
  })

  it('calls next middleware when password is valid', () => {
    const {authenticateRequest} = require('../../../source/middleware/authenticateRequest')
    const reqMock = httpMocks.createRequest({
      headers: { authorization: `Basic: ${encodePassword(config.adminPassword)}` }
    })
    const resMock = httpMocks.createResponse()
    const nextSpy = sinon.spy()

    authenticateRequest(reqMock, resMock, nextSpy)

    expect(nextSpy.called).to.be.true
  })

  it('returns 401 when authorization header is missing', () => {
    const {authenticateRequest} = require('../../../source/middleware/authenticateRequest')
    const reqMock = httpMocks.createRequest()
    const resMock = httpMocks.createResponse()
    const nextDummy = function () { }

    authenticateRequest(reqMock, resMock, nextDummy)

    expect(resMock.statusCode).to.equal(401)
    const {errors} = JSON.parse(resMock._getData())
    const expected = [{ message: 'Authorization header missing' }]
    expect(errors).to.deep.equal(expected)
  })

  it('returns 401 when authorization header is malformed', () => {
    const {authenticateRequest} = require('../../../source/middleware/authenticateRequest')
    const reqMock = httpMocks.createRequest({
      headers: { authorization: 'Basic: ' }
    })
    const resMock = httpMocks.createResponse()
    const nextSpy = sinon.spy()

    authenticateRequest(reqMock, resMock, nextSpy)

    expect(resMock.statusCode).to.equal(401)
    const {errors} = JSON.parse(resMock._getData())
    const expected = [{ message: 'Authorization header format is invalid' }]
    expect(errors).to.deep.equal(expected)
    expect(nextSpy.called).to.be.false
  })
})
