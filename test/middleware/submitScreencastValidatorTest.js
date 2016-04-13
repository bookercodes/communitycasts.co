// @flow

import sinon from 'sinon'
import {expect} from 'chai'
import mockery from 'mockery'
import httpMocks from "node-mocks-http";
import {beforeEach, afterEach, describe, it} from 'mocha'

describe('submitScreencastValidator', () => {

  beforeEach(() => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });
  })

  afterEach(() => {
    mockery.disable()
  })

  it('should export a function', () => {
    const sut = require('../../source/middleware/submitScreencastValidator.js').default
    expect(sut).to.be.a('function')
  })

  it('should invoke next middleware when req.body is valid', async () => {
    // Setup
    const sequelizeConnectMock = {
      models: {
        Screencast: {
          findOne: async () => null
        }
      }
    }
    const youtubeMock = {
      createYoutubeClient: () => ({
        videoExists: () => true
      })
    }
    mockery.registerMock('sequelize-connect', sequelizeConnectMock)
    mockery.registerMock('../../source/util/youtube', youtubeMock)
    const reqMock = httpMocks.createRequest({
      body: {
        url: 'https://www.youtube.com/watch?v=correctly_formatted_youtube_url',
        tags: 'tag1, tag2'
      }
    })
    const resMock = httpMocks.createResponse()
    const nextSpy = sinon.spy()
    const sut = require('../../source/middleware/submitScreencastValidator.js').default

    // Exercise
    await sut(reqMock, resMock, nextSpy)

    // Verify
    expect(nextSpy.called).to.be.true
  })

  it('should return 400 when req.body is totally invalid', async () => {
    const reqMock = httpMocks.createRequest()
    const resMock = httpMocks.createResponse()
    const sut = require('../../source/middleware/submitScreencastValidator.js').default

    await sut(reqMock, resMock)

    expect(resMock.statusCode).to.equal(400)
    const {errors} = JSON.parse(resMock._getData())
    const expected = [
      {
        field: 'url',
        message: 'url cannot be undefined'
      },
      {
        field: 'tags',
        message: 'tags cannot be undefined'
      }
    ]
    expect(errors).to.deep.equal(expected)
  })

  it('should return 400 when "url" isn\'t a correctly formatted YouTube URL', async () => {
    const reqMock = httpMocks.createRequest({
      body: {
        url: 'invalid URL',
        tags: 'tag1, tag2'
      }
    })
    const resMock = httpMocks.createResponse()
    const sut = require('../../source/middleware/submitScreencastValidator.js').default

    await sut(reqMock, resMock)

    expect(resMock.statusCode).to.equal(400)
    const {errors} = JSON.parse(resMock._getData())
    const expected = [
      {
        field: 'url',
        message: 'url must be a valid YouTube URL'
      }
    ]
    expect(errors).to.deep.equal(expected)
  })

  it('should return 400 when "tags" is undefined', async () => {
    // Setup
    const sequelizeConnectMock = {
      models: {
        Screencast: {
          findOne: async () => null
        }
      }
    }
    const youtubeMock = {
      createYoutubeClient: () => ({
        videoExists: () => true
      })
    }
    mockery.registerMock('sequelize-connect', sequelizeConnectMock)
    mockery.registerMock('../../source/util/youtube', youtubeMock)
    const reqMock = httpMocks.createRequest({
      body: {
        url: 'https://www.youtube.com/watch?v=qsDvJrGMSUY'
      }
    })
    const resMock = httpMocks.createResponse()
    const sut = require('../../source/middleware/submitScreencastValidator.js').default

    // Exercise
    await sut(reqMock, resMock)

    // Verify
    expect(resMock.statusCode).to.equal(400)
    const {errors} = JSON.parse(resMock._getData())
    const expected = [
      {
        field: 'tags',
        message: 'tags cannot be undefined'
      }
    ]
    expect(errors).to.deep.equal(expected)
  });

  it('should return 400 when "url" is undefined', async () => {
    const reqMock = httpMocks.createRequest({
      body: {
        tags: 'tags'
      }
    })
    const resMock = httpMocks.createResponse()
    const sut = require('../../source/middleware/submitScreencastValidator.js').default

    await sut(reqMock, resMock)

    expect(resMock.statusCode).to.equal(400)
    const {errors} = JSON.parse(resMock._getData())
    const expected = [
      {
        field: 'url',
        message: 'url cannot be undefined'
      },
    ]
    expect(errors).to.deep.equal(expected)
  });

  it('should return 400 when "url" links to a non-existent YouTube video', async () => {
    // Setup
    const youtubeMock = {
      createYoutubeClient: () => ({
        videoExists: () => false
      })
    }
    mockery.registerMock('../../source/util/youtube', youtubeMock)
    const reqMock = httpMocks.createRequest({
      body: {
        url: 'https://www.youtube.com/watch?v=doesnotexist',
        tags: 'tags'
      }
    })
    const resMock = httpMocks.createResponse()
    const nextSpyDummy = function() {}
    const sut = require('../../source/middleware/submitScreencastValidator.js').default

    // Exercise
    await sut(reqMock, resMock, nextSpyDummy)

    // Verify
    expect(resMock.statusCode).to.equal(400)
    const {errors} = JSON.parse(resMock._getData())
    const expected = [
      {
        field: 'url',
        message: 'url must link to an existent, public YouTube video'
      },
    ]
    expect(errors).to.deep.equal(expected)
  });

  it('should return 400 when "url" has already been submitted', async () => {
    // Setup
    const sequelizeConnectMock = {
      models: {
        Screencast: {
          findOne: async () => ({})
        }
      }
    }
    const youtubeMock = {
      createYoutubeClient: () => ({
        videoExists: () => true
      })
    }
    mockery.registerMock('sequelize-connect', sequelizeConnectMock)
    mockery.registerMock('../../source/util/youtube', youtubeMock)
    const reqMock = httpMocks.createRequest({
      body: {
        url: 'https://www.youtube.com/watch?v=doesnotexist',
        tags: 'tags'
      }
    })
    const resMock = httpMocks.createResponse()
    const nextDummy = function() {}
    const sut = require('../../source/middleware/submitScreencastValidator.js').default

    // Exercise
    await sut(reqMock, resMock, nextDummy)

    // Verify
    expect(resMock.statusCode).to.equal(400)
    const {errors} = JSON.parse(resMock._getData())
    const expected = [
      {
        field: 'url',
        message: 'url has already been submitted'
      },
    ]
    expect(errors).to.deep.equal(expected)
  })
})
