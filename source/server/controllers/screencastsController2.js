'use strict';

var config = require('config');

var screencastsController = function(connection) {
  var sendScreencasts = function(req, res) {
    var page = req.query.page || 1;
    if (req.query.page < 1) {
      return res.status(400).json({
        message: 'Page number cannot be 0 or negative'
      });
    }
    var query = 'SELECT COUNT(*) AS count FROM screencasts s';
    connection.queryAsync(query).spread(function(result) {
      var total = result.shift().count;
      var perPage = config.screencastsPerPage;
      var start = (page - 1) * perPage;
      var finish = page * perPage;
      var totalPageCount = Math.ceil(total / perPage);
      var hasNextPage = page < totalPageCount;
      var query =
        'SELECT * \
         FROM screencasts s \
         ORDER BY (s.referralCount)/POW(((UNIX_TIMESTAMP(NOW())-UNIX_TIMESTAMP(s.submissionDate))/3600)+2,1.5) DESC \
         LIMIT ' + start + ', ' + finish;
      connection.queryAsync(query).spread(function(screencasts) {
        screencasts = screencasts.map(function(screencast) {
          screencast.href =
            'http://localhost:3000/screencasts/' + screencast.screencastId;
          delete screencast.link;
          return screencast;
        });
        res.json({
          screencasts: screencasts,
          hasMore: hasNextPage
        });
      });
    });
  };
  return {
    sendScreencasts: sendScreencasts
  };
};

module.exports = screencastsController;
