'use strict';

var request = require('request');
var moment = require('moment');

function Youtube(key) {
  if (!(this instanceof Youtube)) {
    return new Youtube(key);
  }

  this.key = key;

  this.isYouTubeUrl = function(url) {
    return /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url);
  };

  this.fetchVideoDetails = function(url, callback) {
    if (!this.key) {
      throw new Error('This function requires that you supply a key.');
    }
    var id = parseVideoId(url);
    var apiUrl =
      'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=' +
      id + '&key=' + this.key;
    request(apiUrl, function(error, request, body) {
      if (error) {
        return callback(error);
      }
      var parsed = JSON.parse(body);
      var video = parsed.items[0];
      return callback(null, {
        screencastId: id,
        title: video.snippet.title,
        durationInSeconds: moment.duration(video.contentDetails.duration)
          .asSeconds(),
        channel: {
          name: video.snippet.channelTitle,
        }
      });
    });
  };

  // http://stackoverflow.com/a/9102270
  function parseVideoId(url) {
    var match = url.match(
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if (match && match[2].length === 11) {
      return match[2];
    }
    return undefined;
  }
}

module.exports = Youtube;
