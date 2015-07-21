'use strict';

var config = require('config');
var youtube = require('../youtube')('AIzaSyAMkYVIPo7ZuX5lWjLvSXCcG0zBuBy799U');
var vimeo = require('../vimeo')(config.vimeoKey);
var commaSplit = require('comma-split');

var screencastsController = function (connection) {
  var appendWherePhase = function (query, period) {
    switch (period) {
      case 'month':
        query += ' WHERE s.submissionDate > DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        break;
      case 'week':
        query += ' WHERE s.submissionDate > DATE_SUB(NOW(), INTERVAL 1 WEEK)';
        break;
      default:
        query += ' WHERE s.submissionDate > DATE_SUB(NOW(), INTERVAL 1 DAY)';
        break;
    }
    return query;
  };

  var sendScreencasts = function (req, res) {
    var query = 'SELECT COUNT(*) AS count FROM screencasts s';
    query = appendWherePhase(query, req.params.period);
    connection.query(query, function (error, result) {
      var page = req.query.page;
      var perPage = 5;
      var start = (page - 1) * perPage;
      var finish = page * perPage;
      var total = result[0].count;
      var totalPageCount = Math.ceil(total / perPage);
      var hasNextPage =  page < totalPageCount;
      /*jshint multistr:true*/
      var query = 'SELECT \
          s.*, \
          GROUP_CONCAT(screencastTags.tagName) AS tags \
        FROM screencasts s \
        JOIN screencastTags \
          ON s.screencastId = screencastTags.screencastId';
      query = appendWherePhase(query, req.params.period);
      query += ' GROUP BY s.screencastId ORDER BY referralCount DESC';
      query += ' LIMIT ' + start + ', ' + finish;
      connection.query(query, function (error, screencasts) {
        screencasts = screencasts.map(function (screencast) {
          screencast.href = 'http://localhost:3000/screencasts/' + screencast.screencastId;
          screencast.tags = screencast.tags.split(',');
          delete screencast.link;
          return screencast;
        });
        res.json({
          screencasts: screencasts,
          hasMore: hasNextPage
        });
      });
    });
  };

  var fetchVideoDetails = function (link, done) {
    if (youtube.isYouTubeUrl(link)) {
      youtube.fetchVideoDetails(link, done);
    } else if (vimeo.isVimeoUrl(link)) {
      vimeo.fetchVideoDetails(link, done);
    } else {
      throw new Error('link must be either a YouTube or Vimeo video link');
    }
  };

  var send400 = function (res) {
    // curry the func
    return function (message) {
      res.status(400).send({
        message: message
      });
    };
  };

  var createScreencast = function(req, res) {
    var link = req.body.link;
    var sendErr = send400(res);
    if (!link) {
      return sendErr('Screencast link cannot be blank.');
    }
    if (!youtube.isYouTubeUrl(link) && !vimeo.isVimeoUrl(link)) {
      return sendErr('Please enter a valid YouTube or Vimeo video url.');
    }
    if (!req.body.tags) {
      return sendErr('Tags cannot be blank.');
    }
    var tags = commaSplit(req.body.tags, {
      ignoreWhitespace: true,
      ignoreBlank: true
    });
    if (tags.length > 5) {
      return sendErr('You must specify 5 or less tags.');
    }
    fetchVideoDetails(link, function(e, details) {
      var screencastId;
      var screencast = {
        link: link,
        title: details.title,
        durationInSeconds: details.durationInSeconds
      };
      connection.beginTransactionAsync().then(function() {
        return connection.queryAsync('INSERT INTO screencasts SET ?',
          screencast);
      }).spread(function(result) {
        screencastId = result.insertId;
        var values = tags.map(function(tag) {
          return [tag];
        });
        return connection.queryAsync('INSERT IGNORE INTO tags VALUES ?', [
          values
        ]);
      }).then(function() {
        var values = tags.map(function(tag) {
          return [screencastId, tag];
        });
        return connection.queryAsync(
          'INSERT IGNORE INTO screencastTags VALUES ?', [values]);
      }).then(function() {
        res.status(201).send({
          screencastId: screencastId,
          message: 'Thank you for your submission. Your submission will be reviewed by the moderators and if it meets our guidelines, it\'ll appear on the home page soon!'
        });
        return connection.commit();
      }).error(function(error) {
        console.log(error);
        res.status(500).send('An internal server error occured.');
        return connection.rollback();
      });
    });
  };

  var redirectToScreencast = function(req, res) {
    var screencastId = req.params.screencastId;
    var remoteAddress = req.connection.remoteAddress;
    /* jshint multistr:true */
    var query =
      'SELECT link \
       FROM screencasts \
       WHERE screencastId = ?';
    connection.queryAsync(query, screencastId).spread(function(screencasts) {
      var screencast = screencasts.shift();
      if (!screencast) {
        return res.status(404).send();
      }
      res.redirect(screencast.link);
      var query =
        'SELECT screencastId \
         FROM referrals \
         WHERE screencastId = ? AND refereeRemoteAddress = ?';
      connection.queryAsync(query, [screencastId, remoteAddress]).spread(
        function(referrals) {
          if (referrals.length > 0) {
            return;
          }
          connection.beginTransactionAsync().then(function() {
            /*jshint multistr:true*/
            var query =
              'UPDATE screencasts \
                 SET referralCount = referralCount + 1 \
               WHERE screencastId = ?';
            return connection.queryAsync(query, screencastId);
          }).then(function() {
            return connection.queryAsync(
              'INSERT INTO referrals SET ?', {
                screencastId: screencastId,
                refereeRemoteAddress: remoteAddress
              });
          }).then(function() {
            return connection.commit();
          }).error(function() {
            return connection.rollback();
          });
        });
    });
  };
  return {
    createScreencast: createScreencast,
    sendScreencasts: sendScreencasts,
    redirectToScreencast: redirectToScreencast
  };
};

module.exports = screencastsController;
