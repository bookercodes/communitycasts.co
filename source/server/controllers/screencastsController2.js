'use strict';

var config = require('config');

var screencastsController = function(connection) {
  var sendScreencasts = function (req, res) {
    var query = 'SELECT COUNT(*) AS count FROM screencasts s';
    connection.queryAsync(query).spread(function(result) {
      var total = result.shift().count;
      var page = req.query.page || 1;
      var sort = req.query.sort || 'latest';
      var perPage = config.screencastsPerPage;
      var start = (page - 1) * perPage;
      var finish = page * perPage;
      var totalPageCount = Math.ceil(total / perPage);
      var hasNextPage = page < totalPageCount;
      /*jshint multistr:true*/
      var query = 'SELECT * FROM screencasts s';
      console.log(sort);
      if (sort === 'popular')
        query += ' ORDER BY referralCount DESC, submissionDate';
      else
        query += ' ORDER BY submissionDate DESC';
      query += ' LIMIT ' + start + ', ' + finish;
      connection.queryAsync(query).spread(function(screencasts) {
        res.json(screencasts);
      });
    });
  };
  return {
    sendScreencasts: sendScreencasts
  }
};

module.exports = screencastsController;
