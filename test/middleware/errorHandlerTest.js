import {expect} from 'chai'
import {describe, it} from 'mocha'
import httpMocks from 'node-mocks-http'
import errorHandler from '../../source/middleware/errorHandler.js'

describe('errorHandler', () => {
  it('should exports a function', () => {
    expect(errorHandler).to.be.a('function')
  })

  it('should send correct response', () => {
    const reqMock = httpMocks.createRequest()
    const resMock = httpMocks.createResponse()
    const err = new Error('some err')

    errorHandler(err, reqMock, resMock)

    const resBody = resMock._getData()
    expect(resBody).to.equal(err)
    expect(resMock.statusCode).to.equal(500)
  })
})
