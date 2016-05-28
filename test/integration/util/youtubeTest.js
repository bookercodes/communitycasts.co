// @flow

import config from 'config'
import chaiAsPromised from 'chai-as-promised'
import chai, {expect} from 'chai'
import {describe, it} from 'mocha'
import * as youtubeClient from '../../../source/util/youtubeClient'

chai.use(chaiAsPromised)

describe('youtube', () => {
  describe('fetchVideoDetails', () => {
    it('should throw when key is invalid', () => {
      const client = youtubeClient.create('invalid key')
      return expect(client.fetchVideoDetails('https://youtu.be/jNQXAC9IVRw'))
        .to
        .be
        .rejected
        .then(reason => {
          expect(reason.message).to.match(/Bad Request/)
        })
    })

    it('should return null when video url is malformed', async () => {
      const client = youtubeClient.create(config.youtubeApiKey)
      const actual = await client.fetchVideoDetails('invalid')
      expect(actual).to.be.null
    })

    it('should return null when video doesn\'t exist', async () => {
      const client = youtubeClient.create(config.youtubeApiKey)
      const actual = await client.fetchVideoDetails('https://youtu.be/dNAXAC8KVRw')
      expect(actual).to.be.null
    })

    it('should return correct video details', async () => {
      const client = youtubeClient.create(config.youtubeApiKey)
      const actual = await client.fetchVideoDetails('https://youtu.be/jNQXAC9IVRw')
      expect(actual).to.deep.equal({
        id: 'jNQXAC9IVRw',
        title: 'Me at the zoo',
        description: 'The first video on YouTube.\n\nMaybe it\'s time to go back to the zoo?',
        durationInSeconds: 19,
        channel: {
          id: 'UC4QobU6STFB0P71PMvOGN5A',
          title: 'jawed'
        }
      })
    })
  })

  describe('videoExists', () => {
    it('should return true when video exists', async () => {
      const client = youtubeClient.create(config.youtubeApiKey)
      const actual = await client.videoExists('https://youtu.be/jNQXAC9IVRw')
      expect(actual).to.be.true
    })

    it('should return false when video doesn\'t exist', async () => {
      const client = youtubeClient.create(config.youtubeApiKey)
      const actual = await client.videoExists('https://youtu.be/dNAXAC8KVRw')
      expect(actual).to.be.false
    })
  })
})
