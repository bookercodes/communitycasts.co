'use strict';
// var squel = require('squel');
var winston = require('winston');
var models = require('../models');
var Sequelize = require('Sequelize');

module.exports = function() {
  return {
    send20Tags: function (req, res) {
      winston.info('Sending tags.');
      models.ScreencastTag.findAll({
        group: ['tagName'],
        limit: 20,
        attributes: [
          'tagName',
          [Sequelize.fn('count', 'tagName'), 'count']
        ],
        order: 'count DESC',
        include: [{
          model: models.Screencast,
          where: { approved: true },
          attributes: []
        }]
      }).then(function (screencasts) {
        res.json({ tags: screencasts });
      });
    }
  };
};
