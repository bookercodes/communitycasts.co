// @flow

import config from 'config'
import chaiAsPromised from 'chai-as-promised'
import chai, {expect} from 'chai'
import {describe, it} from 'mocha'
import {createYoutubeClient} from '../../source/util/youtube'

chai.use(chaiAsPromised)

describe('youtube', () => {
  it('createYoutubeClient should return an object', () => {
    const actual = createYoutubeClient(config.youtubeApiKey)
    expect(actual).to.be.an('object')
  })

  describe('fetchVideoDetails', () => {
    it('should return video details', async () => {
      const client = createYoutubeClient(config.youtubeApiKey)
      const actual = await client.fetchVideoDetails('https://youtu.be/jNQXAC9IVRw')

      expect(actual.id).to.equal('jNQXAC9IVRw')
      expect(actual.title).to.equal('Me at the zoo')
      expect(actual.channel.id).to.equal('UC4QobU6STFB0P71PMvOGN5A')
      expect(actual.channel.title).to.equal('jawed')
      expect(actual.durationInSeconds).to.equal(19)
      expect(actual.description).to.match(/^The first video on YouTube/)
    })

    it('should throw when key is invalid', () => {
      const client = createYoutubeClient('invalid key')
      return expect(client.fetchVideoDetails('https://youtu.be/jNQXAC9IVRw'))
        .to
        .be
        .rejected
        .then(reason => {
          expect(reason.message).to.match(/Bad Request/)
        })
    })

    it('should throw when video url is malformed', () => {
      const client = createYoutubeClient(config.youtubeApiKey)
      return expect(client.fetchVideoDetails('invalid'))
        .to
        .be
        .rejected
        .then(reason => {
          expect(reason.message).to.match(/Could not find/)
        })
    })

    it('should throw when video doesn\'t exist', () => {
      const client = createYoutubeClient(config.youtubeApiKey)
      return expect(client.fetchVideoDetails('https://youtu.be/dNAXAC8KVRw'))
        .to
        .be
        .rejected
        .then(reason => {
          expect(reason.message).to.match(/Could not find/)
        })
    })
  })

  describe('videoExists', () => {
    it('should return true when video exists', async () => {
      const client = createYoutubeClient(config.youtubeApiKey)
      const exists = await client.videoExists('https://youtu.be/jNQXAC9IVRw')
      expect(exists).to.be.true
    })

    it('should return false when video doesn\'t exist', async () => {
      const client = createYoutubeClient(config.youtubeApiKey)
      const exists = await client.videoExists('https://youtu.be/dNAXAC8KVRw')
      expect(exists).to.be.false
    })
  })
})
