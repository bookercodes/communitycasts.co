// @flow weak

import moment from 'moment'
import promisify from 'pify'
import youtubeUrl from 'youtube-url'
import youtubeApi from 'youtube-api'

export function create (key) {
  youtubeApi.authenticate({
    type: 'key',
    key
  })

  return {
    async fetchVideoDetails (url) {
      const videoId = youtubeUrl.extractId(url)
      const details = await promisify(youtubeApi.videos.list)({
        id: videoId,
        part: 'snippet,contentDetails'
      })
      if (details.items.length === 0) {
        throw new Error(`Could not find video with id ${videoId}.`)
      }
      const video = details.items[0]
      return {
        id: videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        durationInSeconds: moment.duration(video.contentDetails.duration).asSeconds(),
        channel: {
          id: video.snippet.channelId,
          title: video.snippet.channelTitle
        }
      }
    },

    async videoExists (url) {
      try {
        await this.fetchVideoDetails(url)
        return true
      } catch (error) {
        return false
      }
    }
  }
}
