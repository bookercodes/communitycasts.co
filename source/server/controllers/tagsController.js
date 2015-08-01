'use strict';
var tagsController = function(connection) {
  var sendTags = function (req, res) {
    /*jshint multistr:true*/
    var query =
      'SELECT \
         tags.tagName, \
         COUNT(*) AS count \
       FROM tags \
       JOIN screencastTags \
         ON screencastTags.tagName = tags.tagName \
       GROUP BY tags.tagName \
       ORDER BY count DESC \
       LIMIT 20';
      connection.queryAsync(query).spread(function(tags) {
        res.json(tags);
      });
  };
  return {
    sendTags: sendTags,
  };
};
module.exports = tagsController;
