'use strict';

var config = require('config');
var squel = require('squel');
var moment = require('moment');
var commaSplit = require('comma-split');
var youtube = require('../youtube')(config.youtubeApiKey);
var youtubeUrl = require('youtube-url');
var truncate = require('truncate');
var winston = require('winston');
var models = require('../models');
var Sequelize = require('Sequelize');

require('moment-duration-format');

module.exports = function(connection) {
  function searchScreencasts(req, res) {
    var query = req.params.query;
    winston.info('User searched for ', query);
    models.Screencast.findAll({
      where: {
        approved: true,
        title: {
          $like: '%' + query + '%'
        }
      },
      include: [{
        model: models.Channel
      }, {
        model: models.Tag,
        through: {
          attributes: []
        }
      }]
    }).then(function (screencasts) {
      var o = screencasts.map(function (screencast) {
        delete screencast.dataValues.channelId;
        delete screencast.dataValues.approved;
        delete screencast.dataValues.referralCount;
        screencast.dataValues.duration = moment.duration(screencast.dataValues.durationInSeconds, 'seconds').format('hh:mm:ss');
        delete screencast.dataValues.durationInSeconds;
        screencast.dataValues.description = truncate(screencast.description, config.descriptionLength);
        screencast.dataValues.tags = screencast.dataValues.tags.map(function (tag) {
          return tag.tagName;
        });
        screencast.dataValues.href =
          config.host + 'screencasts/' + screencast.dataValues.screencastId;
        return screencast.dataValues;
      });
      res.send(o);
    });

    //   var sql = squel.select()
    //     .field('screencasts.*')
    //     .field('channels.*')
    //     .field('group_concat(screencastTags.tagName) as tags')
    //     .from('screencasts')
    //     .where('screencasts.approved = 1')
    //     .where('title LIKE ?', '%' + query + '%')
    //     .join('screencastTags', null, 'screencasts.screencastId = screencastTags.screencastId')
    //     .join('channels', null, 'channels.channelId = screencasts.channelId')
    //     .order('featured', false)
    //     .group('screencasts.screencastId')
    //     .toString();
    // connection.queryAsync(sql).spread(function (screencasts) {
    //   screencasts = screencasts.map(_formatScreencast);
    //   res.json(screencasts);
    // });
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
    connection.queryAsync(sql).spread(function (screencasts) {
      if (screencasts.length === 1) {
        winston.info('Could not save screencast because screencast %s already exists in the db. Sending 400 instead.', youtubeId);
        return res.status(400).send({
          message: 'Screencast already exists'
        });
      }
      youtube.getDetails(youtubeId).then(function (screencastDetails) {
        connection.beginTransactionAsync().then(function () {
          return connection.queryAsync('INSERT IGNORE INTO channels SET ?', screencastDetails.channel);
        }).then(function () {
          var screencast = screencastDetails;
          screencast.channelId = screencastDetails.channel.channelId;
          delete screencast.channel;
          return connection.queryAsync('INSERT INTO screencasts SET ?', screencast);
        }).then(function () {
          var values = [tags.map(function (tag) {
            return [tag];
          })];
          return connection.queryAsync('INSERT IGNORE INTO tags VALUES ?', values);
        }).then(function () {
          var values = [tags.map(function (tag) {
            return [youtubeId, tag];
          })];
          return connection.queryAsync('INSERT INTO screencastTags VALUES ?', values);
        }).then(function () {
          winston.info('Successfully saved screencast %s.', youtubeId);
          res.status(201).send();
          return connection.commit();
        }).error(function (error) {
          connection.rollback();
          winston.error('Something went wrong while saving screencast:', error);
          res.status(500).send({
            message: 'An unexpected error occured. It\'s not you, it\'s us. Detailed information about the error has automatically been recorded and we have been notified. Please try again in a couple of minutes.'
          });
        });
      });
    });
  }

  function _formatScreencast(screencast) {
    screencast.href =
      config.host + 'screencasts/' + screencast.screencastId;
    screencast.tags = screencast.tags.split(',');
    screencast.duration = moment.duration(screencast.durationInSeconds, 'seconds').format('hh:mm:ss');
    screencast.description = truncate(screencast.description, config.descriptionLength);
    screencast.channel = {
      channelId: screencast.channelId,
      channelName: screencast.channelName,
      channelLink: screencast.channelLink
    };
    delete screencast.channelId;
    delete screencast.channelName;
    delete screencast.channelLink;
    delete screencast.link;
    delete screencast.durationInSeconds;
    return screencast;
  }

  function sendScreencastsWithTag(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.sort || 'popular';
    var limit = config.screencastsPerPage;
    var offset =  (page - 1) * limit;
    var options = {
      limit: limit,
      offset: offset,
      where: {
        approved: true,
        screencastId: {
          $in: Sequelize.literal(
            '(SELECT DISTINCT screencastId FROM screencastTags WHERE tagName = :tagName)')
        }
      },
      replacements: {
        tagName: req.params.tag
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
      options.order = [['submissionDate', 'DESC']];
    }
    models.Screencast.findAndCountAll(options).then(function (screencasts) {
      var o = {};
      o.totalCount = screencasts.count.toString();
      var totalPageCount = Math.ceil(o.totalCount / config.screencastsPerPage) ;
      o.hasMore = page < totalPageCount;
      o.screencasts = screencasts.rows.map(function (screencast) {
        delete screencast.dataValues.channelId;
        delete screencast.dataValues.approved;
        delete screencast.dataValues.referralCount;
        screencast.dataValues.duration = moment.duration(screencast.dataValues.durationInSeconds, 'seconds').format('hh:mm:ss');
        delete screencast.dataValues.durationInSeconds;
        screencast.dataValues.description = truncate(screencast.description, config.descriptionLength);
        screencast.dataValues.href =
          config.host + 'screencasts/' + screencast.dataValues.screencastId;
        screencast.dataValues.tags = screencast.dataValues.tags.map(function (tag) {
          return tag.tagName;
        });
        return screencast.dataValues;
      });
      res.send(o);
    });
    // var page = req.query.page || 1;
    // var sort = req.query.sort || 'popular';
    // winston.info('Sending screencasts with tag %s (page: %s, sort: %s).', req.params.tag, page, sort);
    // var sql = squel.select()
    //   .field('count(*) as total')
    //   .from(
    //     squel.select()
    //     .field('screencasts.screencastId')
    //     .from('screencasts')
    //     .where('screencasts.approved = 1')
    //     .join('screencastTags', null, 'screencasts.screencastId = screencastTags.screencastId')
    //     .where('screencasts.screencastId IN ?',
    //       squel.select()
    //       .field('screencastId')
    //       .from('screencastTags')
    //       .where('screencastTags.tagName = ?', req.params.tag))
    //     .group('screencasts.screencastId'),
    //     'alias')
    //   .toString();
    // connection.queryAsync(sql).spread(function(result) {
    //   var total = result.shift().total;
    //   var totalPageCount = Math.ceil(total / config.screencastsPerPage);
    //   var hasNextPage = page < totalPageCount;
    //   var start = (page - 1) * config.screencastsPerPage;
    //   var finish = config.screencastsPerPage;
    //   var sql = squel.select()
    //     .field('screencasts.*')
    //     .field('channels.*')
    //     .field('group_concat(screencastTags.tagName) as tags')
    //     .from('screencasts')
    //     .where('screencasts.approved = 1')
    //     .join('screencastTags', null, 'screencasts.screencastId = screencastTags.screencastId')
    //     .join('channels', null, 'channels.channelId = screencasts.channelId')
    //     .where('screencasts.screencastId in ?',
    //       squel.select()
    //       .field('screencastId')
    //       .from('screencastTags')
    //       .where('screencastTags.tagName = ?', req.params.tag))
    //     .order('featured', false)
    //     .group('screencasts.screencastId');
    //   if (sort === 'popular') {
    //     // http://amix.dk/blog/post/19574
    //     sql.order('(screencasts.referralCount)/pow(((unix_timestamp(now())-unix_timestamp(screencasts.submissionDate))/3600)+2,1.5)', false);
    //   } else {
    //     sql.order('submissionDate', false);
    //   }
    //   sql = sql.offset(start).limit(finish).toString();
    //   connection.queryAsync(sql).spread(function(screencasts) {
    //     screencasts = screencasts.map(_formatScreencast);
    //     res.json({
    //       screencasts: screencasts,
    //       hasMore: hasNextPage,
    //       totalCount: total
    //     });
    //   });
    // });
  }

  function sendScreencasts(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.sort || 'popular';
    var limit = config.screencastsPerPage;
    var offset =  (page - 1) * limit;
    winston.info('Sending all screencasts (page: %s, sort: %s).', page, sort);
    var options = {
      limit: limit,
      offset: offset,
      where: {
        approved: true
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
      options.order = [['submissionDate', 'DESC']];
    }
    models.Screencast.findAndCountAll(options).then(function (screencasts) {
      var o = {};
      o.totalCount = screencasts.count.toString();
      var totalPageCount = Math.ceil(o.totalCount / config.screencastsPerPage) ;
      o.hasMore = page < totalPageCount;
      o.screencasts = screencasts.rows.map(function (screencast) {
        delete screencast.dataValues.channelId;
        delete screencast.dataValues.approved;
        delete screencast.dataValues.referralCount;
        screencast.dataValues.duration = moment.duration(screencast.dataValues.durationInSeconds, 'seconds').format('hh:mm:ss');
        delete screencast.dataValues.durationInSeconds;
        screencast.dataValues.description = truncate(screencast.description, config.descriptionLength);
        screencast.dataValues.tags = screencast.dataValues.tags.map(function (tag) {
          return tag.tagName;
        });
        screencast.dataValues.href =
          config.host + 'screencasts/' + screencast.dataValues.screencastId;
        return screencast.dataValues;
      });
      res.send(o);
    });
    // var sql = squel.select()
    //   .field('count(*) as count')
    //   .from('screencasts')
    //   .where('approved = 1')
    //   .toString();
    // connection.queryAsync(sql).spread(function(result) {
    //   var total = result.shift().count;
    //   var totalPageCount = Math.ceil(total / config.screencastsPerPage);
    //   var hasNextPage = page < totalPageCount;
    //   var start = (page - 1) * config.screencastsPerPage;
    //   var finish = config.screencastsPerPage;
    //   var sql = squel.select()
    //     .field('screencasts.*')
    //     .field('channels.*')
    //     .field('group_concat(screencastTags.tagName) as tags')
    //     .from('screencasts')
    //     .where('screencasts.approved = 1')
    //     .join('screencastTags', null, 'screencasts.screencastId = screencastTags.screencastId')
    //     .join('channels', null, 'channels.channelId = screencasts.channelId')
    //     .order('featured', false)
    //     .group('screencasts.screencastId');
    //   if (sort === 'popular') {
    //     // http://amix.dk/blog/post/19574
    //     sql = sql.order('(screencasts.referralCount)/pow(((unix_timestamp(now())-unix_timestamp(screencasts.submissionDate))/3600)+2,1.5)', false);
    //   } else {
    //     sql = sql.order('submissionDate', false);
    //   }
    //   sql = sql.offset(start).limit(finish).toString();
    //
    //   connection.queryAsync(sql).spread(function(screencasts) {
    //     screencasts = screencasts.map(_formatScreencast);
    //     res.json({
    //       screencasts: screencasts,
    //       hasMore: hasNextPage,
    //       totalCount: total
    //     });
    //   });
    // });
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

  return {
    sendScreencasts: sendScreencasts,
    sendScreencastsWithTag: sendScreencastsWithTag,
    redirectToScreencast: redirectToScreencast,
    saveScreencast: saveScreencast,
    searchScreencasts: searchScreencasts
  };
};
