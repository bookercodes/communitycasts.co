var express = require('express');
var winston = require('winston');
var youtube = require('../youtube');

winston.add(winston.transports.File, {  filename: 'errors.log' });
youtube.authenticate('AIzaSyCKQFYlDRi5BTd1A-9rhFjF8Jb_Hlfnquk');

var router = express.Router();

router.get('/submit', function(req, res) { res.render('submit'); });
router.post('/submit', function (req, res) {
  req.checkBody('url', 'Enter a <strong>screencast link</strong>.').notEmpty();
  req.checkBody('url', 'Enter a valid YouTube <strong>screencast link</strong>.').matches(/^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/);
  req.checkBody('technologies', 'Enter at least one <strong>technology</strong>').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    res.render('submit', { errors: errors });
    return;
  }
  var screencastId = youtube.parseIdFromUrl(req.body.url);
  var tags = req.body.technologies.split(',');
  var query = 
    'SELECT screencastId \
     FROM screencasts \
     WHERE screencastId = ?';
  connection.queryAsync(query, screencastId).spread(function (screencasts) {
    if (screencasts.length === 1) {
      res.locals.errors = ['This <strong>screencast link</strong> has already been submitted.'];
      res.render('submit');
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
      }).then(function(result) {
        var record = screencast;
        record.channelId = screencast.channel.channelId;
        delete record.channel;
        return connection.query('INSERT INTO screencasts SET ?', record);
      }).then(function(result) {
        var values = tags.map(function(tag) { return [tag]; });
        return connection.queryAsync('INSERT IGNORE INTO tags(tagName) VALUES ?', [values])
      }).then(function(result) {
        var values = tags.map(function(tag) { return [screencast.screencastId, tag]; });
        return connection.queryAsync('INSERT INTO screencastTags VALUES ?', [values])
      }).then(function() {
        res.locals.message = 'Thank you for your submission. Your submission will be reviewed by the moderators and if it meets our guidelines, it\'ll appear on the home page soon!';
        res.render('submit');
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
        // the user with this ip has seen the screencast before, do not count the view again.
        return;
      var query = 
        'UPDATE screencasts \
           SET referralCount = referralCount + 1 \
         WHERE screencastId = ?';
      connection.queryAsync(query, req.params.screencastId);
      connection.query('INSERT INTO referrals SET ?', { 
        screencastId: req.params.screencastId, 
        refereeRemoteAddress: req.connection.remoteAddress
      });
    });
  }); 
});

router.get('/tagged/other',function(req,res) { 
  res.locals.tagName = 'Other';
  res.render('technology');
});

router.get('/tagged/:technology', function (req, res) {
  res.locals.tagName = req.params.technology;
  res.render('technology');
});

module.exports = router;