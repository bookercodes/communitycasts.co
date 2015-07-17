'use strict';

var config = require('config');
var youtube = require('../youtube')('AIzaSyAMkYVIPo7ZuX5lWjLvSXCcG0zBuBy799U');
var vimeo = require('../vimeo')(config.vimeoKey);
var commaSplit = require('comma-split');

var screencastsController = function (connection) {
  var sendScreencasts = function (req, res) {
    var query = 'SELECT COUNT(*) AS count FROM screencasts s';
    switch (req.params.period) {
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
      switch (req.params.period) {
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

  var createScreencast = function (req,res) {
    if (!req.body.link) {
      res.status(400).send({message:'Screencast link cannot be blank.'});
      return;
    }
    if (!req.body.tags) {
      res.status(400).send({message:'Tags cannot be blank.'});
      return;
    }
    if (!youtube.isYouTubeUrl(req.body.link) && !vimeo.isVimeoUrl(req.body.link)) {
      res.status(400).send({message:'Please enter a valid YouTube or Vimeo video url.'});
      return;
    }
    var screencast = {
      link: req.body.link,
    };
    function insert() {
      connection.query('INSERT INTO screencasts SET ?', screencast, function (error, result) {
        screencast.id = result.insertId;
        var tags = commaSplit(req.body.tags, {
          ignoreWhitespace: true,
          ignoreBlank: true
        });
        var values = tags.map(function(tag) { return [tag]; });
        connection.query('INSERT IGNORE INTO tags VALUES ?', [values], function () {
          var values = tags.map(function(tag) { return [screencast.id, tag]; });
          connection.query('INSERT IGNORE INTO screencastTags VALUES ?', [values], function () {
            res.status(201).send({screencastId: screencast.id, message:'Thank you for your submission. Your submission will be reviewed by the moderators and if it meets our guidelines, it\'ll appear on the home page soon!'});
          });
        });
      });
    }
    if (youtube.isYouTubeUrl(req.body.link)) {
      youtube.fetchVideoDetails(req.body.link, function(error, details) {
        screencast.title = details.title;
        screencast.durationInSeconds = details.durationInSeconds;
        insert();
      });
      return;
    }
    vimeo.fetchVideoDetails(req.body.link, function (error, details) {
      screencast.title = details.title;
      screencast.durationInSeconds = details.durationInSeconds;
      insert();
    });
  };
  var redirectToScreencast = function (req, res) {
    connection.query('SELECT link FROM screencasts WHERE screencastId = ?', req.params.screencastId, function (error, results) {
      if (results.length === 0) {
        return res.status(404).send();
      }
      var screencast = results[0];
      res.redirect(screencast.link);
      /*jshint multistr:true*/
      var query =
        'SELECT screencastId \
         FROM referrals \
         WHERE screencastId = ? AND refereeRemoteAddress = ?';
      connection.query(query, [req.params.screencastId, req.connection.remoteAddress], function (errors, referrals) {
        if (referrals.length !== 0) {
          return;
        }
        /*jshint multistr:true*/
        var query =
          'UPDATE screencasts \
             SET referralCount = referralCount + 1 \
           WHERE screencastId = ?';
        connection.query(query, req.params.screencastId, function () {
          connection.query('INSERT INTO referrals SET ?', {
            screencastId: req.params.screencastId,
            refereeRemoteAddress: req.connection.remoteAddress
          });
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
