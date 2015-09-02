'use strict';

var paperwork = require('paperwork');
var youtubeUrl = require('youtube-url');

module.exports.validateSubmission = function() {
  return paperwork.accept({
    tags: String,
    url: paperwork.all(String, function(url) {
      return youtubeUrl.valid(url);
    }),
  });
};
