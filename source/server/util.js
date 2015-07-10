'use strict';

module.exports.split = function (text) {

  var tags = text.split(',');

  tags = tags.filter(function(tag) {
    return /\S/.test(tag);
  });

  tags = tags.filter(function(item, pos, self) {
     return self.indexOf(item) === pos;
  });

  tags = tags.map(function(tag) {
    return tag.trim();
  });
  
  return tags;
};
