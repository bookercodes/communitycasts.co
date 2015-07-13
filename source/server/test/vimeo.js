'use strict';

var config = require('config');
var sut = require('../vimeo')(config.vimeoKey);
/*jshint unused:false*/
var should = require('should');
var async = require('async');

describe('vimeo', function () {

  describe('constructor', function () {
    it('should set key', function () {
      var KEY = 'foo';
      var Vimeo = require('../vimeo');
      var instance = new Vimeo(KEY);
      instance.key.should.equal(KEY);
    });
    it('should return instance', function () {
      var KEY = 'foo';
      var instance = require('../vimeo')(KEY);
      instance.key.should.equal(KEY);
    });
  });

  describe('isVimeoUrl', function () {
    it('returns correct result', function () {
      // TODO: What about domains other than .com, should they be valid, too?
      // Domains that start with http:// rather than https://?
      // Domains that without www.?
      // https://twitter.com/Vimeo/status/620631334847799296 ?
      sut.isVimeoUrl('https://vimeo.com/60131454').should.equal(true);
      sut.isVimeoUrl('https://vimeo.com/61905359').should.equal(true);

      sut.isVimeoUrl('https://communitycasts.co').should.equal(false);
      sut.isVimeoUrl('https://vimeo.com/').should.equal(false);
    });
  });

  describe('fetchVideoDetails', function () {
    it('should return correct details', function (done) {
      async.parallel([
        function (done) {
          sut.fetchVideoDetails('https://vimeo.com/120981003', function (error, details) {
            details.title.should.equal('We love the floor we step on');
            details.durationInSeconds.should.equal(77);
            details.channel.name.should.equal('Alberto Gastesi');
            done();
          });
        },
        function (done) {
          sut.fetchVideoDetails('https://vimeo.com/133342821', function (error, details) {
            details.title.should.equal('DELOREAN \'CRYSTAL\'');
            details.durationInSeconds.should.equal(220);
            details.channel.name.should.equal('Joan Guasch');
            done();
          });
        }
      ], function () {
        done();
      });
    });
    it('should throw if key has not been supplied', function() {
      var instanceWithoutKey = require('../vimeo')();
      (function() {
        instanceWithoutKey.fetchVideoDetails(
          'https://vimeo.com/133342821');
      }).should.throw(Error, {
        message: 'This function requires that you supply a key.'
      });
    });
  });
});
