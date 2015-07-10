'use strict';

var sut = require('../vimeo');
/*jshint unused:false*/
var should = require('should');

describe('vimeo', function () {
  describe('isVimeoUrl', function () {
    it('returns correct result', function () {
      // TODO: What about domains other than .com, should they be valid, too?
      // Domains that start with http:// rather than https://?
      // Domains that without www.?
      sut.isVimeoUrl('https://vimeo.com/60131454').should.equal(true);
      sut.isVimeoUrl('https://vimeo.com/61905359').should.equal(true);

      sut.isVimeoUrl('https://communitycasts.co').should.equal(false);
      sut.isVimeoUrl('https://vimeo.com/').should.equal(false);
    });
  });
});
