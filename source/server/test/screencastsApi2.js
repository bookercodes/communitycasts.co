'use strict';

var request = require('supertest');
var server = require('../server');
var mysql = require('mysql');
/*jshint unused:false*/
var should = require('should');

describe('screencasts redirect route', function () {
  it('should send 404 if screencast is nonexistent', function (done) {
    request(server)
      .get('/screencasts/100')
      .expect(404, done);
  });
});
