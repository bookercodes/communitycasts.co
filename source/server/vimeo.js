
'use strict';

var request = require('request');

function Vimeo(key) {
  if (!(this instanceof Vimeo)) {
    return new Vimeo(key);
  }

  this.key = key;

  this.isVimeoUrl = function (url) {
    return /^(https?\:\/\/)?(www\.)?vimeo\.com\/.+$/.test(url);
  };

  this.fetchVideoDetails = function (url, callback) {
    var id = parseVideoId(url);
    var options = {
      url: 'https://api.vimeo.com/videos/' + id,
      headers: {
        'Authorization': 'bearer ' + this.key
      }
    };
    request(options, function (error, response, body) {
      if (error) {
        return callback(error);
      }
      var parsed = JSON.parse(body);
      callback(null, {
        title: parsed.name,
        durationInSeconds: parsed.duration,
        channel: {
          name: parsed.user.name
        }
      });
    });

  };

  function parseVideoId(url) {
    var index = url.lastIndexOf('/');
    var result = url.substr(index+1);
    return result;
  }
}

module.exports = Vimeo;
