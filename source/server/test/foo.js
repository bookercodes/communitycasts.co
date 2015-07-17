'use strict';

var request = require('supertest');
var server = require('../server');

describe('createScreencast()', function () {
  it('should return error if link is not Vimeo or YouTube link', function (done) {
    var screencast = { link:'http://www.foo.com/123' };
    request(server)
      .post('/screencasts')
      .send(screencast)
      .expect(400)
      .expect({ message: 'Please enter a valid YouTube or Vimeo video url.'}, done);
  });
});
