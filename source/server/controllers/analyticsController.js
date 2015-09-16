'use strict';
var squel = require('squel');

module.exports = function(connection) {
  return {
    sendAnalytics: function (req, res) {

      // var sql = squel.select()
      //   .field('count(*) as screencastCount')
      //   .from('screencasts')
      //   .toString();

      // var sql = squel.select()
      //   .field('sum(referralCount) as screencastCount')
      //   .from('screencasts')
      //   .toString();

      // var sql = squel.select()
      //   .field('count(*) as tagsCount')
      //   .from('tags')
      //   .toString();

      // var sql = squel.select()
      //   .field('tagName')
      //   .field('count(*) as count')
      //   .from('screencastTags')
      //   .group('tagName')
      //   .order('count', false)
      //   .limit(1)
      //   .toString();
      //
      // connection.queryAsync(sql).spread(function (result) {
      //   res.send(result);
      // });

      // total number screencasts
    }
  };
};
