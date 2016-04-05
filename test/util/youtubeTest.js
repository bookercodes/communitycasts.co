// @flow

import config from 'config'
import {expect} from 'chai'
import {suite, test} from 'mocha';
import Youtube from '../../source/util/youtube'

suite('youtube', () => {

  test('youtube exports a function', () => {
    expect(Youtube).to.be.a('function')
  })

  test('youtube has apiKey property', () => {
    const { apiKey } = new Youtube(config.youtubeApiKey)

    expect(apiKey).to.equal(config.youtubeApiKey)
  })

  test('fetchVideoDetails returns correct result', async () => {
    const youtube = new Youtube(config.youtubeApiKey)
    const actual = await youtube.fetchVideoDetails('https://youtu.be/jNQXAC9IVRw')

    expect(actual.id).to.equal('jNQXAC9IVRw')
    expect(actual.title).to.equal('Me at the zoo')
    expect(actual.channel.id).to.equal('UC4QobU6STFB0P71PMvOGN5A')
    expect(actual.channel.title).to.equal('jawed')
    expect(actual.durationInSeconds).to.equal(19)
    expect(actual.description).to.match(/^The first video on YouTube/)
  })
})
