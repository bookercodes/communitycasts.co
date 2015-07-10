'use strict';

var sut = require('../youtube');
/*jshint unused:false*/
var should = require('should');

describe('isYouTubeUrl', function () {
  it('returns correct result', function () {
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
