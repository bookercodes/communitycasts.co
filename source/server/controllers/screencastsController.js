'use strict';

var config = require('config');
var Sequelize = require('sequelize');
var moment = require('moment');
var commaSplit = require('comma-split');
var truncate = require('truncate');
var winston = require('winston');
var youtubeUrl = require('youtube-url');
var youtube = require('../youtube')(config.youtubeApiKey);
var models = require('../models');

require('moment-duration-format');

module.exports = function() {

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
        },
        featured: screencast.featured,
        referralCount: screencast.referralCount
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
      options.order = 'featured DESC, (`Screencast`.`referralCount`) / pow(((unix_timestamp(now()) - unix_timestamp(`Screencast`.`submissionDate`)) / 3600) + 2, 1.5) DESC';
    } else {
      options.order = [
        ['featured', 'DESC'],
        ['submissionDate', 'DESC']
      ];
    }
    return options;
  }

  function _executeScreencastsQuery(query, req) {
    return models.Screencast.findAndCountAll(query).then(function(screencasts) {
      var model = {
        totalCount: screencasts.count.toString(),
        screencasts: _mapScreencasts(screencasts.rows)
      };
      var totalPageCount = Math.ceil(model.totalCount / config.screencastsPerPage);
      model.hasMore = (req.query.page || 1) < totalPageCount;
      return model;
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
    _executeScreencastsQuery(query, req).then(model => res.json(model));
  }

  function sendScreencasts(req, res) {
    _executeScreencastsQuery(_buildScreencastsQuery(req), req).then(model => res.json(model));
  }

  function searchScreencasts(req, res) {
    winston.info('User searched for', req.params.query);
    var query = _buildScreencastsQuery(req);
    query.where.title = {
      $like: '%' + req.params.query + '%'
    };
    _executeScreencastsQuery(query, req).then(model => res.json(model));
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

  function saveScreencast(req, res) {
    winston.info('User submitted screencast with body %s. Attempting to save screencast...', JSON.stringify(req.body));
    var youtubeId = youtubeUrl.extractId(req.body.url);
    var tags = commaSplit(req.body.tags, {
      ignoreDuplicate: true
    }).map(function(tag) {
      return {
        tagName: tag
      };
    });
    models.Screencast.findById(youtubeId).then(function(screencast) {
      if (screencast !== null) {
        winston.info('Could not save screencast because screencast %s already exists in the db. Sending 400 instead.', youtubeId);
        return res.status(400).send({
          message: 'Screencast already exists'
        });
      }
      youtube.getDetails(youtubeId).then(function(screencastDetails) {
        models.sequelize.transaction(function(t) {
          return models.Tag.bulkCreate(tags, {
            transaction: t,
            ignoreDuplicates: true
          }).then(function() {
            return models.Channel.create(screencastDetails.channel, {
              transaction: t
            }).catch(Sequelize.UniqueConstraintError, function() {});
          }).then(function() {
            return models.Screencast.create({
              screencastId: youtubeId,
              title: screencastDetails.title,
              durationInSeconds: screencastDetails.durationInSeconds,
              description: screencastDetails.description,
              channelId: screencastDetails.channel.channelId
            }, {
              transaction: t
            });
          }).then(function() {
            var screencastTags = tags.map(function(tag) {
              return {
                screencastId: youtubeId,
                tagName: tag.tagName
              };
            });
            return models.ScreencastTag.bulkCreate(screencastTags, {
              transaction: t
            });
          });
        });
      }).then(function() {
        res.status(201).send();
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
