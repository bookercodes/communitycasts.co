
'use strict';

function Vimeo(key) {
  if (!(this instanceof Vimeo)) {
    return new Vimeo(key);
  }

  this.key = key;

  this.isVimeoUrl = function (url) {
    return /^(https?\:\/\/)?(www\.)?vimeo\.com\/.+$/.test(url);
  };
}

module.exports = Vimeo;
