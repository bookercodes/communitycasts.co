var request = require('request');

function YouTube(key) {
  if (!key) {
    throw new Error('invalid key: ' + key);
  }
  this.key = key;
  this.endpoint = 'https://www.googleapis.com/youtube/v3/videos'
}

YouTube.prototype.getInfo = function(id, callback) {
  var url = this.endpoint + '?part=snippet,contentDetails&id=' + id + '&key=' + this.key;
  request(url, function (err, res, data) {
    var parsed = JSON.parse(data);

    if(parsed.pageInfo.totalResults == 0) {
      callback(null);
      return;
    }

    var video = parsed.items[0];
    var result = {
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnailUrl: video.snippet.thumbnails.default.url,
      publishedAt: video.snippet.publishedAt,
      duration: video.contentDetails.duration,
      hd: video.contentDetails.definition == 'hd',
      channel: {
        channelName: video.snippet.channelTitle,
        channelId: video.snippet.channelId,  
      }
    }
    callback(result);
  });
}

YouTube.prototype.extractId = function(url) {
  var pattern = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = url.match(pattern);
  if (match && match[2].length == 11) {
    return match[2];
  }
}

module.exports = YouTube;