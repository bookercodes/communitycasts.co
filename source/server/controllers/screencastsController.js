'use strict';

var config = require('config');
var squel = require('squel');

module.exports = function(connection) {

  function sendScreencastsWithTag(req, res) {
    var page = req.query.page || 1;
    var query = squel.select()
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
    connection.queryAsync(query).spread(function(result) {
      var total = result.shift().total;
      var perPage = config.screencastsPerPage;
      var sort = req.query.sort || 'popular';
      if (sort !== 'popular' && sort !== 'latest') {
        return res.status(400).json({
          message: 'You input the sort option "' + sort + '" which is invalid. The sort option must be "latest" or "popular". Thank you.'
        });
      }
      var start = (page - 1) * perPage;
      var finish = perPage;
      var totalPageCount = Math.ceil(total / perPage);
      var hasNextPage = page < totalPageCount;

      var query = squel.select()
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
          query.order('(screencasts.referralCount)/pow(((unix_timestamp(now())-unix_timestamp(screencasts.submissionDate))/3600)+2,1.5)', false);
        } else {
          query.order('submissionDate', false);
        }
        query = query.limit(start, finish)
          .toString();
      connection.queryAsync(query).spread(function (screencasts) {
        screencasts = screencasts.map(function(screencast) {
          screencast.href =
            'http://localhost:3000/screencasts/' + screencast.screencastId;
          screencast.tags = screencast.tags.split(',');
          delete screencast.link;
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
    if (req.query.page < 1) {
      return res.status(400).json({
        message: 'Page number cannot be 0 or negative'
      });
    }
    var query = squel.select()
      .field('count(*) as count')
      .from('screencasts')
      .toString();
    connection.queryAsync(query).spread(function(result) {
      var total = result.shift().count;
      var perPage = config.screencastsPerPage;
      var sort = req.query.sort || 'popular';
      if (sort !== 'popular' && sort !== 'latest') {
        return res.status(400).json({
          message: 'You input the sort option "' + sort + '" which is invalid. The sort option must be "latest" or "popular". Thank you.'
        });
      }
      var start = (page - 1) * perPage;
      var finish = perPage;
      var totalPageCount = Math.ceil(total / perPage);
      var hasNextPage = page < totalPageCount;
      var query = squel.select()
        .field('screencasts.*')
        .field('group_concat(screencastTags.tagName) as tags')
        .from('screencasts')
        .join('screencastTags', null, 'screencasts.screencastId = screencastTags.screencastId')
        .group('screencasts.screencastId');
      if (sort === 'popular') {
        // http://amix.dk/blog/post/19574
        query.order('(screencasts.referralCount)/pow(((unix_timestamp(now())-unix_timestamp(screencasts.submissionDate))/3600)+2,1.5)', false);
      } else {
        query.order('submissionDate', false);
      }
      query = query.limit(start, finish)
        .toString();
      connection.queryAsync(query).spread(function(screencasts) {
        screencasts = screencasts.map(function(screencast) {
          screencast.href =
            'http://localhost:3000/screencasts/' + screencast.screencastId;
          screencast.tags = screencast.tags.split(',');
          delete screencast.link;
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
    var query = squel.select()
      .from('screencasts')
      .where('screencastId = ?', screencastId)
      .toString();
    connection.queryAsync(query).spread(function(screencasts) {
      var screencast = screencasts.shift();
      if (!screencast) {
        return res.status(404).send();
      }
      res.redirect(screencast.link);
      var query = squel.select()
        .field('screencastId')
        .from('referrals')
        .where('screencastId = ? AND refereeRemoteAddress = ?', screencastId, remoteAddress)
        .toString();
      connection.queryAsync(query).spread(function(referrals) {
        var alreadyCounted = referrals.length > 0;
        if (alreadyCounted) {
          // this user's view has already been counted - do not count it again!
          return;
        }
        connection.beginTransactionAsync().then(function() {
          var query = squel.update()
            .table('screencasts')
            .set('referralCount = referralCount + 1')
            .where('screencastId = ?', screencastId)
            .toString();
          return connection.queryAsync(query);
        }).then(function() {
          var query = squel.insert()
            .into('referrals')
            .set('screencastId', screencastId)
            .set('refereeRemoteAddress', remoteAddress)
            .toString();
          return connection.queryAsync(query);
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
