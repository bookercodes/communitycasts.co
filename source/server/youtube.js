'use strict';

var request = require('request');
var promise = require('bluebird');
var moment = require('moment');
var request = promise.promisify(require('request'));

module.exports = function(apiKey) {
  function getDetails(videoId) {
    var url =
      'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=' +
      videoId + '&key=' + apiKey;
    // return promise
    return request(url).spread(function(request, body) {
      var parsed = JSON.parse(body);
      if (parsed.items.length === 0) {
        // no video found
        return null;
      }
      var screencast = parsed.items[0];
      return {
        screencastId: videoId,
        description: screencast.snippet.description,
        title: screencast.snippet.title,
        durationInSeconds: moment.duration(screencast.contentDetails.duration)
          .asSeconds(),
        channel: {
          channelName: screencast.snippet.channelTitle,
          channelId: screencast.snippet.channelId,
        }
      };
    });
  }
  return {
    getDetails: getDetails
  };
};
