// @flow weak

import moment from 'moment'
import Promise from 'bluebird'
import youtubeUrl from 'youtube-url'
import youtubeApi from 'youtube-api'

/**
 * createYoutubeClient
 * Creates a YouTube client.
 *
 * @name createYoutubeClient
 * @function
 * @param {String} key A simple YouTube API key.
 * @returns {Object} The YouTube client.
 */
export function createYoutubeClient(key) {

  youtubeApi.authenticate({
    type: 'key',
    key
  })

  const youtubeClient = {}

  /**
   * fetchVideoDetails
   * Fetches details about a video from the YouTube API.
   *
   * @name fetchVideoDetails
   * @function
   * @param {String} url The url of the video to fetch details about.
   * @returns {Object} Details about the video.
   */
  youtubeClient.fetchVideoDetails = async function(url) {
    const videoId = youtubeUrl.extractId(url)
    const list = Promise.promisify(youtubeApi.videos.list)
    const details = await list({
      id: videoId,
      part: 'snippet,contentDetails'
    })
    if (details.items.length === 0) {
      throw new Error(`Could not find video with id ${videoId}.`)
    }
    const video = details.items[0];
    return {
      id: videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      durationInSeconds: moment.duration(video.contentDetails.duration).asSeconds(),
      channel: {
        id: video.snippet.channelId,
        title: video.snippet.channelTitle,
      }
    }
  }

  /**
   * videoExists
   * Determines whether or not a video exists.
   *
   * @name videoExists
   * @function
   * @param {String} url - The url of the video whose existence to check
   * @returns {Boolean} True if the video exists; otherwise, false
   */
  youtubeClient.videoExists = async function(url) {
    try {
      await this.fetchVideoDetails(url)
      return true
    } catch(error) {
      return false
    }
  }

  return youtubeClient
}
