'use strict';

var config = require('config');
var Sequelize = require('Sequelize');
var squel = require('squel');
var moment = require('moment');
var commaSplit = require('comma-split');
var truncate = require('truncate');
var winston = require('winston');
var youtubeUrl = require('youtube-url');
var youtube = require('../youtube')(config.youtubeApiKey);
var models = require('../models');

require('moment-duration-format');

module.exports = function(connection) {

  function _mapScreencasts(screencasts) {
    return screencasts.map(function(screencast) {
      screencast = screencast.dataValues;
      return {
        screencastId: screencast.screencastId,
        title: screencast.title,
        description: truncate(screencast.description, config.descriptionLength),
        href: config.host + 'api/screencasts/' + screencast.screencastId,
        duration: moment
          .duration(screencast.durationInSeconds, 'seconds')
          .format('hh:mm:ss'),
        tags: screencast.Tags.map(tag => tag.tagName),
        submissionDate: screencast.submissionDate,
        channel: {
          channelId: screencast.Channel.channelId,
          channelName: screencast.Channel.channelName
        }
      };
    });
  }

  function _buildScreencastsQuery(req) {
    var page = req.query.page || 1;
    var sort = req.query.sort || 'popular';
    var limit = config.screencastsPerPage;
    var offset = (page - 1) * limit;
    var options = {
      limit: limit,
      offset: offset,
      where: {
        approved: true,
      },
      include: [{
        model: models.Channel
      }, {
        model: models.Tag,
        through: {
          attributes: []
        }
      }]
    };
    if (sort === 'popular') {
      options.order = '(`Screencast`.`referralCount`) / pow(((unix_timestamp(now()) - unix_timestamp(`Screencast`.`submissionDate`)) / 3600) + 2, 1.5)';
    } else {
      options.order = [
        ['submissionDate', 'DESC']
      ];
    }
    return options;
  }

  function _executeScreencastsQuery(query, req, res) {
    models.Screencast.findAndCountAll(query).then(function(screencasts) {
      var model = {
        totalCount: screencasts.count.toString(),
        screencasts: _mapScreencasts(screencasts.rows)
      };
      var totalPageCount = Math.ceil(model.totalCount / config.screencastsPerPage);
      model.hasMore = (req.query.page || 1) < totalPageCount;
      res.send(model);
    });
  }

  function sendScreencastsWithTag(req, res) {
    var query = _buildScreencastsQuery(req, res);
    query.where.screencastId = {
      $in: Sequelize.literal('(SELECT DISTINCT screencastId FROM screencastTags WHERE tagName = :tagName)')
    };
    query.replacements = {
      tagName: req.params.tag
    };
    _executeScreencastsQuery(query, req, res);
  }

  function sendScreencasts(req, res) {
    _executeScreencastsQuery(_buildScreencastsQuery(req), req, res);
  }

  function redirectToScreencast(req, res) {
    var screencastId = req.params.screencastId;
    var remoteAddress = req.ip;
    models.Screencast.findById(screencastId).then(function(screencast) {
      if (screencast === null) {
        winston.info(
          'Could not redirect user %s to screencast %s because screencast %s does not exist. Sending 404 instead.',
          remoteAddress, screencastId, screencastId);
        return res.status(404).send();
      }
      res.redirect('https://www.youtube.com/watch?v=' + screencast.screencastId);
      winston.info(
        'Successfully redirected user %s to screencast %s. Attempting to count redirect...',
        remoteAddress, screencastId);
      models.Referral.find({
        where: {
          screencastId: screencastId,
          refereeRemoteAddress: remoteAddress
        }
      }).then(function(referrals) {
        if (referrals !== null) {
          winston.info(
            'User %s has already been redirected to screencast %s. Deliberately *not* counting redirect again.',
            remoteAddress, screencastId);
          return;
        }
        models.Screencast.findById(screencastId).then(function(screencast) {
          models.sequelize.transaction(function(transaction) {
            return screencast.increment({
              referralCount: 1
            }, {
              transaction: transaction
            }).then(function() {
              models.Referral
                .create({
                  screencastId: screencastId,
                  refereeRemoteAddress: remoteAddress
                }, {
                  transaction: transaction
                });
            });
          }).then(function() {
            winston.info(
              'Successfully counted redirect to %s for user %s',
              screencastId,
              remoteAddress);
          }).catch(function(error) {
            winston.error(
              'Something went wrong while counting referral:',
              error);
          });
        });
      });
    });
  }

  function searchScreencasts(req, res) {
    winston.info('User searched for', req.params.query);
    var query = _buildScreencastsQuery(req);
    query.where.title = {
      $like: '%' + req.params.query + '%'
    };
    _executeScreencastsQuery(query, req, res);
  }

  function saveScreencast(req, res) {
    winston.info('User submitted screencast with body %s. Attempting to save screencast...', JSON.stringify(req.body));
    var youtubeId = youtubeUrl.extractId(req.body.url);
    var tags = commaSplit(req.body.tags, {
      ignoreDuplicate: true
    });
    var sql = squel.select()
      .from('screencasts')
      .field('screencastId')
      .where('screencastId = ?', youtubeId)
      .toString();
    connection.queryAsync(sql).spread(function(screencasts) {
      if (screencasts.length === 1) {
        winston.info('Could not save screencast because screencast %s already exists in the db. Sending 400 instead.', youtubeId);
        return res.status(400).send({
          message: 'Screencast already exists'
        });
      }
      youtube.getDetails(youtubeId).then(function(screencastDetails) {
        connection.beginTransactionAsync().then(function() {
          return connection.queryAsync('INSERT IGNORE INTO channels SET ?', screencastDetails.channel);
        }).then(function() {
          var screencast = screencastDetails;
          screencast.channelId = screencastDetails.channel.channelId;
          delete screencast.channel;
          return connection.queryAsync('INSERT INTO screencasts SET ?', screencast);
        }).then(function() {
          var values = [tags.map(function(tag) {
            return [tag];
          })];
          return connection.queryAsync('INSERT IGNORE INTO tags VALUES ?', values);
        }).then(function() {
          var values = [tags.map(function(tag) {
            return [youtubeId, tag];
          })];
          return connection.queryAsync('INSERT INTO screencastTags VALUES ?', values);
        }).then(function() {
          winston.info('Successfully saved screencast %s.', youtubeId);
          res.status(201).send();
          return connection.commit();
        }).error(function(error) {
          connection.rollback();
          winston.error('Something went wrong while saving screencast:', error);
          res.status(500).send({
            message: 'An unexpected error occured. It\'s not you, it\'s us. Detailed information about the error has automatically been recorded and we have been notified. Please try again in a couple of minutes.'
          });
        });
      });
    });
  }
  return {
    sendScreencasts: sendScreencasts,
    sendScreencastsWithTag: sendScreencastsWithTag,
    redirectToScreencast: redirectToScreencast,
    saveScreencast: saveScreencast,
    searchScreencasts: searchScreencasts
  };
};
