'use strict';

function Youtube(key) {
  if (!(this instanceof Youtube)) {
    return new Youtube(key);
  }

  this.key = key;

  this.isYouTubeUrl = function (url) {
    return /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url);
  };
}

module.exports = Youtube;
