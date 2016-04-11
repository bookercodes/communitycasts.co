// @flow

import {expect} from 'chai'
import {describe, it} from 'mocha';
import httpMocks from "node-mocks-http";
import sinon from 'sinon';
import submitScreencastValidator from '../../source/middleware/submitScreencastValidator.js'

describe('submitScreencastValidator', () => {

  it('should export a function', () => {
    expect(submitScreencastValidator).to.be.a('function')
  })

  it ('should call next middleware when request body is valid', () => {
    const req = httpMocks.createRequest({
      body: {
        url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY',
        tags: 'tag1'
      }
    })
    const res = httpMocks.createResponse()
    const next = sinon.spy()

    submitScreencastValidator(req, res, next)

    expect(next.called).to.be.true
  })

  it('should return 400 when all fields are invalid', () => {
    const req = httpMocks.createRequest()
    const res = httpMocks.createResponse()

    submitScreencastValidator(req, res)

    expect(res.statusCode).to.equal(400)
    const {errors} = JSON.parse(res._getData())
    const expected = [
      {
        field: 'url',
        message: 'url is missing'
      },
      {
        field: 'tags',
        message: 'tags is missing'
      }
    ]
    expect(errors).to.deep.equal(expected)
  })

  it('should return 400 when url is invalid', () => {
    const req = httpMocks.createRequest({
      body: {
        url: 'invalid url',
        tags: 'tag1'
      }
    })
    const res = httpMocks.createResponse()

    submitScreencastValidator(req, res)

    expect(res.statusCode).to.equal(400)
    const {errors} = JSON.parse(res._getData())
    const expected = [
      {
        field: 'url',
        message: 'url is not a valid YouTube url'
      }
    ]
    expect(errors).to.deep.equal(expected)
  })

  it('should return 400 when tags is empty', function () {
    const req = httpMocks.createRequest({
      body: {
        url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY'
      }
    })
    const res = httpMocks.createResponse()

    submitScreencastValidator(req, res)

    expect(res.statusCode).to.equal(400)
    const {errors} = JSON.parse(res._getData())
    const expected = [
      {
        field: 'tags',
        message: 'tags is missing'
      }
    ]
    expect(errors).to.deep.equal(expected)
  });

  it('should return 400 when url doesn\'t exist', function () {
    const req = httpMocks.createRequest({
      body: {
        tags: 'tags'
      }
    })
    const res = httpMocks.createResponse()

    submitScreencastValidator(req, res)

    expect(res.statusCode).to.equal(400)
    const {errors} = JSON.parse(res._getData())
    const expected = [
      {
        field: 'url',
        message: 'url is missing'
      },
    ]
    expect(errors).to.deep.equal(expected)
  });
})
