'use strict';

import paperwork from 'paperwork';
import youtubeUrl from 'youtube-url';

module.exports.submissionValidator = paperwork.accept({
  tags: String,
  url: paperwork.all(String, url => youtubeUrl.valid(url))
});

module.exports.paginationValidator = function(req, res, next) {
  var page = req.query.page || 1;
  var sort = req.query.sort || 'popular';
  if (sort !== 'popular' && sort !== 'new') {
    return res.status(400).json({
      message: 'invalid sort option. valid options are popular and new.'
    });
  }
  if (page < 1) {
    return res.status(400).json({
      message: 'page must be >= 1'
    });
  }
  next();
};
