'use strict';

var _ = require('lodash');

module.exports.split = function (text) {

  var tags = text.split(',');
  tags = tags.map(function(tag) {
    return tag.trim();
  });
  tags = _.uniq(tags);
  tags = _.without(tags, '');
  return tags;
};
