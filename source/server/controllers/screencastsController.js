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
      var query = 'SELECT * FROM screencasts s';
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
      query += ' ORDER BY referralCount DESC';
      query += ' LIMIT ' + start + ', ' + finish;
      connection.query(query, function (error, screencasts) {
        screencasts = screencasts.map(function (screencast) {
          screencast.href = 'http://localhost:3000/screencasts/' + screencast.screencastId;
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
            res.status(201).send({message:'Thank you for your submission. Your submission will be reviewed by the moderators and if it meets our guidelines, it\'ll appear on the home page soon!'});
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
      var screencast = results[0];
      res.redirect(screencast.link);
    });
  };
  return {
    createScreencast: createScreencast,
    sendScreencasts: sendScreencasts,
    redirectToScreencast: redirectToScreencast
  };
};

module.exports = screencastsController;
