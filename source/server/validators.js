'use strict';

var paperwork = require('paperwork');
var youtubeUrl = require('youtube-url');

module.exports.createSubmissionValidator = paperwork.accept({
  tags: String,
  url: paperwork.all(String,
    function(url) {
      return youtubeUrl.valid(url);
    })
});

module.exports.createPaginationValidator = function(req, res, next) {
  var page = req.query.page || 1;
  var sort = req.query.sort || 'popular';
  if (sort !== 'popular' && sort !== 'newest') {
    return res.status(400).json({
      message: 'invalid sort option. valid options are popular and newest.'
    });
  }
  if (page < 1) {
    return res.status(400).json({
      message: 'page must be >= 1'
    });
  }
  next();
};
