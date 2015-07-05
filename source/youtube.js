var Promise = require('bluebird');
var moment  = require('moment');
var request = Promise.promisify(require('request'));

var youtube = (function() {
  var authenticate = function(key) {
    this.key = key;
  };
  var get = function (id) {
    var url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=' + id + '&key=' + this.key;
    return request(url).spread(function(request, body) {
      var parsed = JSON.parse(body);
      if (parsed.items.length === 0) {
        // no video with id 'id' found
        return null;
      }
      var screencast = parsed.items[0];
      return {
        screencastId: id,
        title: screencast.snippet.title,
        durationInSeconds: moment.duration(screencast.contentDetails.duration).asSeconds(),
        channel: {
          channelName: screencast.snippet.channelTitle,
          channelId: screencast.snippet.channelId,
        }
      };
    });
  };
  var parseIdFromUrl = function (url) {
    var pattern = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(pattern);
    if (match && match[2].length == 11) {
      return match[2];
    }
  };
  return {
    authenticate: authenticate,
    get: get,
    parseIdFromUrl: parseIdFromUrl
  };
})();

module.exports = youtube;
