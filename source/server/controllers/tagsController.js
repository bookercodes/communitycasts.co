'use strict';
var winston = require('winston');
import tags from '../stores/tagStore';

module.exports = {
  send20Tags: function(req, res) {
    winston.info('Sending tags.');
    tags
      .get(20)
      .then(screencasts => res.json({ tags: screencasts }));
  }
};
