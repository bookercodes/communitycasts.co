// @flow

import {extractId} from 'youtube-url'
import youtubeApiClient from 'youtube-api'
import moment from 'moment'

type VideoDetails = {
  id: string,
  title: string,
  description: string,
  durationInSeconds: string,
  channel: {
    id: string,
    title: string
  }
}

export default class YouTube {
  apiKey: string;

  constructor(youtubeApiKey: string) {
    this.apiKey = youtubeApiKey;

    youtubeApiClient.authenticate({
      type: 'key',
      key: this.apiKey
    })
  }

  fetchVideoDetails(youtubeUrl: string) : Promise<VideoDetails> {
    const videoId = extractId(youtubeUrl)
    return new Promise((resolve, reject) => {
      youtubeApiClient.videos.list({
        id: videoId,
        part: 'snippet,contentDetails'
      }, function(err, details) {
        const screencast = details.items.shift();
        if (!screencast) {
          reject({
            name: 'YoutubeVideoDoesNotExist'
          })
          return
        }
        resolve({
          id: videoId,
          title: screencast.snippet.title,
          description: screencast.snippet.description,
          durationInSeconds: moment.duration(screencast.contentDetails.duration).asSeconds(),
          channel: {
            id: screencast.snippet.channelId,
            title: screencast.snippet.channelTitle,
          }
        })
      })
    })
  }
}
