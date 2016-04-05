import {expect} from 'chai'
import {suite, test} from 'mocha';
import httpMocks from "node-mocks-http";
import errorHandler from '../../source/middleware/errorHandler.js'

suite('errorHandler', () => {
  test('exports a function', () => {
    expect(errorHandler).to.be.a('function')
  })

  test('sends correct response', () => {
    const req = httpMocks.createRequest()
    const res = httpMocks.createResponse()
    const err = new Error('some err')

    errorHandler(err, req, res)

    const resBody = res._getData()
    expect(resBody).to.equal(err)
    expect(res.statusCode).to.equal(500)
  })
})
