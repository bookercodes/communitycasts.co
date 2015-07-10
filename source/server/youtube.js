'use strict';

module.exports.isYouTubeUrl = function (url) {
  return /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url);
};
