'use strict';

var sut = require('../youtube')('AIzaSyAMkYVIPo7ZuX5lWjLvSXCcG0zBuBy799U');
/*jshint unused:false*/
var should = require('should');
var async = require('async');

describe('youtube', function() {

  describe('constructor', function() {
    it('should set key', function() {
      var KEY = 'foo';
      var Youtube = require('../youtube');
      var instance = new Youtube(KEY);
      instance.key.should.equal(KEY);
    });
    it('should return instance', function() {
      var KEY = 'foo';
      var instance = require('../youtube')(KEY);
      instance.key.should.equal(KEY);
    });
  });

  describe('isYouTubeUrl', function() {
    it('returns correct result', function() {
      // TODO: What about domains other than .com, should they be valid, too?
      // Domains that start with http:// rather than https://?
      // Domains that without www.?
      sut.isYouTubeUrl('https://www.youtube.com/watch?v=CsGYh8AacgY').should.equal(true);
      sut.isYouTubeUrl('https://www.youtube.com/watch?v=QFCSXr6qnv4').should.equal(true);
      sut.isYouTubeUrl('https://www.youtube.com/watch?v=9bZkp7q19f0').should.equal(true);
      sut.isYouTubeUrl('https://youtu.be/CsGYh8AacgY').should.equal(true);
      sut.isYouTubeUrl('https://youtu.be/9bZkp7q19f0').should.equal(true);
      sut.isYouTubeUrl('https://communitycasts.co').should.equal(false);
      sut.isYouTubeUrl('https://youtube.com/').should.equal(false);
      sut.isYouTubeUrl('https://youtu.be/').should.equal(false);
    });
  });

  describe('fetchVideoDetails', function() {
    it('should return correct details', function(done) {
      async.parallel([
        function(done) {
          sut.fetchVideoDetails(
            'https://www.youtube.com/watch?v=jNQXAC9IVRw',
            function(error, details) {
              details.title.should.equal('Me at the zoo');
              details.durationInSeconds.should.equal(19);
              details.channel.name.should.equal('jawed');
              done();
            });
        },
        function(done) {
          sut.fetchVideoDetails(
            'https://www.youtube.com/watch?v=jNQXAC9IVRw',
            function(error, details) {
              sut.fetchVideoDetails(
                'https://youtu.be/bNF_P281Uu4',
                function(error, details) {
                  details.title.should.equal('Where the Hell is Matt? 2006');
                  details.durationInSeconds.should.equal(224);
                  details.channel.name.should.equal('Matt Harding');
                  done();
                });
            });
        }
      ], function() {
        done();
      });
    });
    it('should throw if key has not been supplied', function() {
      var instanceWithoutKey = require('../youtube')();
      (function() {
        instanceWithoutKey.fetchVideoDetails(
          'https://www.youtube.com/watch?v=jNQXAC9IVRw');
      }).should.throw(Error, {
        message: 'This function requires that you supply a key.'
      });
    });
  });
});
