'use strict';
var squel = require('squel');
var winston = require('winston');

module.exports = function(connection) {
  return {
    send20Tags: function (req, res) {
      winston.info('Sending tags.');
      var sql = squel.select()
        .from('tags')
        .field('tags.tagName')
        .field('count(*) as count')
        .join('screencastTags', null, 'screencastTags.tagName = tags.tagName')
        .group('tags.tagName')
        .order('count', false)
        .limit(20)
        .toString();
        connection.queryAsync(sql).spread(function(tags) {
          res.json({tags:tags});
        });
    }
  };
};
