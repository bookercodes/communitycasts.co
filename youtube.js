var Promise = require("bluebird");
var request = Promise.promisify(require('request'));

function Youtube() {
}

Youtube.prototype.authenticate = function(key) {
  this.key = key;
};

Youtube.prototype.get = function (id) {
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
      duration: screencast.contentDetails.duration,
      channel: {
        channelName: screencast.snippet.channelTitle,
        channelId: screencast.snippet.channelId,  
      }
    };
  });
}

module.exports = new Youtube();