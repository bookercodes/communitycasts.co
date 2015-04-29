var moment = require('moment');
var request = require('request');

module.exports.convertRecordsToLocals = function (records) {
  records.forEach(function(record) {
    record.technologies = record.technologies.split(',');
    record.duration = moment.duration(record.durationInSeconds, 'seconds').humanize();
    delete record.durationInSeconds;
  });
};

var key = 'AIzaSyCKQFYlDRi5BTd1A-9rhFjF8Jb_Hlfnquk';
module.exports.getVideo = function (id, callback) {
  var url =  'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=' + id + '&key=' + key;
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
};