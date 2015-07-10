'use strict';

module.exports.isVimeoUrl = function (url) {
  return /^(https?\:\/\/)?(www\.)?vimeo\.com\/.+$/.test(url);
};
