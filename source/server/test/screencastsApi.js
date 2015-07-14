'use strict';

var request = require('supertest');
var server = require('../server');

describe('screencasts route', function () {
  it('should store should return 201', function (done) {
    request(server)
      .post('/screencasts')
      .send({
        link: 'https://www.youtube.com/watch?v=XuLRKMqozwA',
        tags: 'JavaScript, Node, MySQL'
      })
      .expect(201, done);
    });
});
