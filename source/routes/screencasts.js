var express = require('express');
var winston = require('winston');
var youtube = require('../youtube');

winston.add(winston.transports.File, {  filename: 'errors.log' });
youtube.authenticate('AIzaSyAMkYVIPo7ZuX5lWjLvSXCcG0zBuBy799U');

var router = express.Router();

router.get('/submit', function(req, res) { res.render('submit'); });
router.post('/submit', function (req, res) {
  req.checkBody('url', 'Enter a <strong>screencast link</strong>.').notEmpty();
  req.checkBody('url', 'Enter a valid YouTube <strong>screencast link</strong>.').matches(/^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/);
  req.checkBody('tags', 'Enter at least one <strong>tag</strong>.').notEmpty();
  req.checkBody('tags', 'Enter less than three <strong>tags</strong>.').hasLessThan3Tags();
  req.checkBody('tags', 'You cannot enter the <strong>tag</strong> "Other". That is a reserved tag.').doesNotContainTagOther();

  var errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    res.redirect('/screencasts/submit');
    return;
  }
  var screencastId = youtube.parseIdFromUrl(req.body.url);
  var tags = req.body.tags.split(',');
  tags = tags.filter(function(tag) { return /\S/.test(tag) });  // remove empty tags
  tags = tags.filter(function(item, pos, self) { return self.indexOf(item) == pos; }); // remove duplicate tags
  tags = tags.map(function(tag) { return tag.trim(); }); // remove trailing whitespace
  tags = tags.map(function(tag) { return tag.trim(); }); // remove trailing whitespace
  var query = 
    'SELECT screencastId, status \
     FROM screencasts \
     WHERE screencastId = ?';
  connection.queryAsync(query, screencastId).spread(function (screencasts) {
    if (screencasts.length === 1) {
      switch (screencasts[0].status) {
        case 'approved': 
          req.flash('errors', ['This <strong>screencast link</strong> has already been submitted.']);
          break;
        case 'pending': 
          req.flash('errors', ['This <strong>screencast link</strong> has already been submitted and is <strong>pending approval</strong>. Hopefully it\'ll appear on the site soon.']);
          break;
        case 'denied': 
          req.flash('errors', ['This <strong>screencast link</strong> has already been submitted and <strong>denied</strong> because it does not meet our guidelines. Sometimes mistakes happen. If you would like to dispute this, please <a href="mailto:alexbooker@fastmail.im">get in touch</a>.']);
          break;
      }
      res.redirect('/screencasts/submit');
      return;
    }
    youtube.get(screencastId).then(function(screencast) {
      if (screencast === null) {
        res.locals.errors = ['The <strong>screencast link</strong> you entered does not exist.'];
        res.render('submit');
        return;
      }
      connection.beginTransactionAsync().then(function() {
        return connection.queryAsync('INSERT IGNORE INTO channels SET ?', screencast.channel);
      }).then(function() {
        var record = screencast;
        record.channelId = screencast.channel.channelId;
        delete record.channel;
        return connection.query('INSERT INTO screencasts SET ?', record);
      }).then(function() {
        var values = tags.map(function(tag) { return [tag]; });
        return connection.queryAsync('INSERT IGNORE INTO tags(tagName) VALUES ?', [values])
      }).then(function() {
        var values = tags.map(function(tag) { return [screencast.screencastId, tag]; });
        return connection.queryAsync('INSERT INTO screencastTags VALUES ?', [values])
      }).then(function() {
        req.flash('success', 'Thank you for your submission. Your submission will be reviewed by the moderators and if it meets our guidelines, it\'ll appear on the home page soon!');
        res.redirect('/screencasts/submit');
        return connection.commit();
      }).error(function(error){
        winston.error(error);
        res.status(500).send('We apologize, but an error occured while submitting this screencast. It\'s not you, it\'s us. This is our fault. Information about this error has been automatically recorded. If you want, you can try submitting your screencast again.');
        return connection.rollback();
      });
    });
  });
});

router.get('/:screencastId', function (req ,res) {
  var query = 
  'SELECT screencastId \
   FROM screencasts \
   WHERE screencastId = ?';
  connection.queryAsync(query, req.params.screencastId).spread(function (screencasts) {
    if (screencasts.length === 0)
      // no screencast with this id exists, return 404 not found.
      return res.sendStatus(404);  
    res.redirect('https://www.youtube.com/watch?v=' + req.params.screencastId);
    // redirect the user as soon as possible, then record their view in the background.
    var query = 
      'SELECT screencastId \
       FROM referrals \
       WHERE screencastId = ? AND refereeRemoteAddress = ?';
    connection.queryAsync(query, [req.params.screencastId, req.connection.remoteAddress]).spread(function(referrals) {
      if (referrals.length !== 0) 
        // the user with this ip has seen the screencast before, do not increment the referral count again.
        return;
      connection.beginTransactionAsync().then (function() {
        var query = 
          'UPDATE screencasts \
             SET referralCount = referralCount + 1 \
           WHERE screencastId = ?';
        return connection.queryAsync(query, req.params.screencastId)
      }).then(function() {
        return connection.queryAsync('INSERT INTO referrals SET ?', { 
          screencastId: req.params.screencastId, 
          refereeRemoteAddress: req.connection.remoteAddress
        });
      }).then(function() {
        return connection.commit();
      }).error(function(error){
        winston.error(error);
        return connection.rollback();
      });
    });
  });
});

router.get('/tagged/other',function(req,res) { 
  res.locals.tagName = 'Other';
  res.render('screencasts');
});

router.get('/tagged/:technology', function (req, res) {
  res.locals.tagName = req.params.technology;
  res.render('screencasts');
});

module.exports = router;