// @flow

import moment from 'moment'
import promisify from 'pify'
import youtubeUrl from 'youtube-url'
import youtubeApi from 'youtube-api'

type YoutubeVideoDetails = {
  id: string,
  title: string,
  description: string,
  durationInSeconds: number,
  channel: {
    id: string,
    title: string
  }
}

export function create (key: string) {
  youtubeApi.authenticate({
    type: 'key',
    key
  })

  return {
    async fetchVideoDetails (url: string): Promise<YoutubeVideoDetails> {
      const videoId = youtubeUrl.extractId(url)
      const videoList = await promisify(youtubeApi.videos.list)({
        id: videoId,
        part: 'snippet,contentDetails'
      })
      if (videoList.items.length === 0) {
        throw new Error(`Could not find video with id ${videoId}.`)
      }
      const video = videoList.items[0]
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

    async videoExists (url: string): Promise<boolean> {
      try {
        await this.fetchVideoDetails(url)
        return true
      } catch (error) {
        return false
      }
    }
  }
}
