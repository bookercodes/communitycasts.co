'use strict';

var request = require('supertest');
var server = require('../server');

describe('createScreencast()', function () {
  it('should return error if link is blank', function (done) {
    var screencast = { link: '' };
    request(server)
      .post('/screencasts')
      .send(screencast)
      .expect(400)
      .expect({ message: 'Screencast link cannot be blank.'}, done);
  });
  it('should return error if link is not Vimeo or YouTube link', function (done) {
    var screencast = { link:'http://www.foo.com/123', tags:'foo' };
    request(server)
      .post('/screencasts')
      .send(screencast)
      .expect(400)
      .expect({ message: 'Please enter a valid YouTube or Vimeo video url.'}, done);
  });
  it('should return error if tags are blank', function (done) {
    var screencast = { link: 'https://www.youtube.com/watch?v=9bZkp7q19f0', tags: ''};
    request(server)
      .post('/screencasts')
      .send(screencast)
      .expect(400)
      .expect({ message: 'Tags cannot be blank.'}, done);
  });
});
