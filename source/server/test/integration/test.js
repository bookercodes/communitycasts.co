'use strict';
var request = require('supertest-as-promised');
var app = require('../../index');

describe('i dunno', function() {
  it('does stuff', function(done) {
    request(app)
      .get('/foo')
      .expect(200, done);
  });
});
