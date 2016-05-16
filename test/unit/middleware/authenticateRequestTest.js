// @flow

import {expect} from 'chai'
import {describe, it, before} from 'mocha'
import sinon from 'sinon'
import httpMocks from 'node-mocks-http'
import mockery from 'mockery'

describe('authenticateRequest', () => {
  const adminPassword = 'some password'

  before(() => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    })
    mockery.registerMock('config', {
      adminPassword
    })
  })

  it('should export a function', () => {
    const sut = require('../../../source/middleware/authenticateRequest').default
    expect(sut).to.be.a('function')
  })

  it('should return 401 when password is invalid', () => {
    const sut = require('../../../source/middleware/authenticateRequest').default
    const encodedInvalidPassword = new Buffer('invalid password').toString('base64')
    const reqMock = httpMocks.createRequest({
      headers: { authorization: `Basic: ${encodedInvalidPassword}` }
    })
    const resMock = httpMocks.createResponse()
    const nextSpy = sinon.spy()
    sut(reqMock, resMock, nextSpy)
    expect(resMock.statusCode).to.equal(401)
    const {errors} = JSON.parse(resMock._getData())
    const expected = [{ message: 'Invalid password' }]
    expect(errors).to.deep.equal(expected)
    expect(nextSpy.called).to.equal(false)
  })

  it('should call next middleware when password is valid', () => {
    const sut = require('../../../source/middleware/authenticateRequest').default
    const encodedValidPassword = new Buffer(adminPassword).toString('base64')
    const reqMock = httpMocks.createRequest({
      headers: { authorization: `Basic: ${encodedValidPassword}` }
    })
    const resMock = httpMocks.createResponse()
    const nextSpy = sinon.spy()
    sut(reqMock, resMock, nextSpy)
    expect(nextSpy.called).to.be.true
  })

  it('should return 404 when authorization header is missing', () => {
    const sut = require('../../../source/middleware/authenticateRequest').default
    const reqMock = httpMocks.createRequest()
    const resMock = httpMocks.createResponse()
    sut(reqMock, resMock)
    expect(resMock.statusCode).to.equal(401)
    const {errors} = JSON.parse(resMock._getData())
    const expected = [{ message: 'Authorization header missing' }]
    expect(errors).to.deep.equal(expected)
  })

  it('should return 401 when authorization header is malformed', () => {
    const sut = require('../../../source/middleware/authenticateRequest').default
    const reqMock = httpMocks.createRequest({
      headers: { authorization: 'Basic: ' }
    })
    const resMock = httpMocks.createResponse()
    const nextSpy = sinon.spy()
    sut(reqMock, resMock, nextSpy)
    expect(resMock.statusCode).to.equal(401)
    const {errors} = JSON.parse(resMock._getData())
    const expected = [{ message: 'Authorization header format is invalid' }]
    expect(errors).to.deep.equal(expected)
    expect(nextSpy.called).to.equal(false)
  })
})
