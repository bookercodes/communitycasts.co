'use strict';

var config = require('config');
var squel = require('squel');
var moment = require('moment');

module.exports = function(connection) {

  function sendScreencastsWithTag(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.sort || 'popular';
    if (sort !== 'popular' && sort !== 'latest') {
      return res.status(400).json({
        message: 'You input the sort option "' + sort + '" which is invalid. The sort option must be "latest" or "popular". Thank you.'
      });
    }
    var sql = squel.select()
      .field('count(*) as total')
      .from(
        squel.select()
        .field('screencasts.screencastId')
        .from('screencasts')
        .join('screencastTags', null, 'screencasts.screencastId = screencastTags.screencastId')
        .where('screencasts.screencastId IN ?',
          squel.select()
          .field('screencastId')
          .from('screencastTags')
          .where('screencastTags.tagName = ?', req.params.tag))
        .group('screencasts.screencastId'),
        'alias')
      .toString();
    connection.queryAsync(sql).spread(function(result) {
      var total = result.shift().total;
      var totalPageCount = Math.ceil(total / config.screencastsPerPage);
      var hasNextPage = page < totalPageCount;
      var start = (page - 1) * config.screencastsPerPage;
      var finish = config.screencastsPerPage;
      var sql = squel.select()
        .field('screencasts.*')
        .field('group_concat(screencastTags.tagName) as tags')
        .from('screencasts')
        .join('screencastTags', null, 'screencasts.screencastId = screencastTags.screencastId')
        .where('screencasts.screencastId in ?',
          squel.select()
          .field('screencastId')
          .from('screencastTags')
          .where('screencastTags.tagName = ?', req.params.tag))
        .group('screencasts.screencastId');
      if (sort === 'popular') {
        // http://amix.dk/blog/post/19574
        sql.order('(screencasts.referralCount)/pow(((unix_timestamp(now())-unix_timestamp(screencasts.submissionDate))/3600)+2,1.5)', false);
      } else {
        sql.order('submissionDate', false);
      }
      sql = sql.limit(start, finish).toString();
      connection.queryAsync(sql).spread(function(screencasts) {
        screencasts = screencasts.map(function(screencast) {
          screencast.href =
            'http://localhost:3000/screencasts/' + screencast.screencastId;
          screencast.tags = screencast.tags.split(',');
          screencast.duration = moment.duration(screencast.durationInSeconds, 'seconds').humanize();
          delete screencast.link;
          delete screencast.durationInSeconds;
          return screencast;
        });
        res.json({
          screencasts: screencasts,
          hasMore: hasNextPage,
          totalCount: total
        });
      });
    });
  }

  function sendScreencasts(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.sort || 'popular';
    if (sort !== 'popular' && sort !== 'latest') {
      return res.status(400).json({
        message: 'You input the sort option "' + sort + '" which is invalid. The sort option must be "latest" or "popular". Thank you.'
      });
    }
    if (req.query.page < 1) {
      return res.status(400).json({
        message: 'Page number cannot be 0 or negative'
      });
    }
    var sql = squel.select()
      .field('count(*) as count')
      .from('screencasts')
      .toString();
    connection.queryAsync(sql).spread(function(result) {
      var total = result.shift().count;
      var totalPageCount = Math.ceil(total / config.screencastsPerPage);
      var hasNextPage = page < totalPageCount;
      var start = (page - 1) * config.screencastsPerPage;
      var finish = config.screencastsPerPage;
      var sql = squel.select()
        .field('screencasts.*')
        .field('group_concat(screencastTags.tagName) as tags')
        .from('screencasts')
        .join('screencastTags', null, 'screencasts.screencastId = screencastTags.screencastId')
        .group('screencasts.screencastId');
      if (sort === 'popular') {
        // http://amix.dk/blog/post/19574
        sql.order('(screencasts.referralCount)/pow(((unix_timestamp(now())-unix_timestamp(screencasts.submissionDate))/3600)+2,1.5)', false);
      } else {
        sql.order('submissionDate', false);
      }
      sql = sql.limit(start, finish).toString();
      connection.queryAsync(sql).spread(function(screencasts) {
        screencasts = screencasts.map(function(screencast) {
          screencast.href =
            'http://localhost:3000/screencasts/' + screencast.screencastId;
          screencast.tags = screencast.tags.split(',');
          screencast.duration = moment.duration(screencast.durationInSeconds, 'seconds').humanize();
          delete screencast.link;
          delete screencast.durationInSeconds;
          return screencast;
        });
        res.json({
          screencasts: screencasts,
          hasMore: hasNextPage,
          totalCount: total
        });
      });
    });
  }

  function redirectToScreencast(req, res) {
    var screencastId = req.params.screencastId;
    var remoteAddress = req.connection.remoteAddress;
    var sql = squel.select()
      .from('screencasts')
      .where('screencastId = ?', screencastId)
      .toString();
    connection.queryAsync(sql).spread(function(screencasts) {
      var screencast = screencasts.shift();
      if (!screencast) {
        return res.status(404).send();
      }
      res.redirect(screencast.link);
      var sql = squel.select()
        .field('screencastId')
        .from('referrals')
        .where('screencastId = ? AND refereeRemoteAddress = ?', screencastId, remoteAddress)
        .toString();
      connection.queryAsync(sql).spread(function(referrals) {
        var alreadyCounted = referrals.length > 0;
        if (alreadyCounted) {
          // this user's view has already been counted - do not count it again!
          return;
        }
        connection.beginTransactionAsync().then(function() {
          var sql = squel.update()
            .table('screencasts')
            .set('referralCount = referralCount + 1')
            .where('screencastId = ?', screencastId)
            .toString();
          return connection.queryAsync(sql);
        }).then(function() {
          var sql = squel.insert()
            .into('referrals')
            .set('screencastId', screencastId)
            .set('refereeRemoteAddress', remoteAddress)
            .toString();
          return connection.queryAsync(sql);
        }).then(function() {
          return connection.commit();
        }).error(function() {
          return connection.rollback();
        });
      });
    });
  }

  return {
    sendScreencasts: sendScreencasts,
    sendScreencastsWithTag: sendScreencastsWithTag,
    redirectToScreencast: redirectToScreencast
  };
};
