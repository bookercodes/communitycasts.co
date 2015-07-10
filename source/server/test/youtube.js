var sut = require('../youtube');
var should = require('should');

describe('the isYouTubeUrl function', function () {
  it('should return true if input is a valid YouTube link', function () {
    sut.isYouTubeUrl('https://www.youtube.com/watch?v=CsGYh8AacgY').should.equal(true);
    sut.isYouTubeUrl('https://youtu.be/CsGYh8AacgY').should.equal(true);
    sut.isYouTubeUrl('https://www.youtube.com/watch?v=QFCSXr6qnv4').should.equal(true);
    sut.isYouTubeUrl('https://www.youtube.com/watch?v=9bZkp7q19f0').should.equal(true);
    sut.isYouTubeUrl('https://youtu.be/9bZkp7q19f0').should.equal(true);
  });
  it('should return false if input is not a valid YouTube link', function () {
    sut.isYouTubeUrl('http://communitycasts.co').should.equal(false);
    sut.isYouTubeUrl('http://youtube.com').should.equal(false);
  });
});
