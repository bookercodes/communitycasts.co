'use strict';

var request = require('supertest');
var server = require('../server');
var mysql = require('mysql');
/*jshint unused:false*/
var should = require('should');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'communityCasts'
});
connection.connect();

describe('screencasts route', function () {
  function wipeDatabase(done) {
    /* jshint multistr:true*/
    var query = '\
    SET FOREIGN_KEY_CHECKS=0; \
    TRUNCATE TABLE screencasts; \
    TRUNCATE TABLE tags; \
    TRUNCATE TABLE screencastTags; \
    TRUNCATE TABLE referrals; \
    SET FOREIGN_KEY_CHECKS=1;';
    connection.query(query, function (error, result) {
      done();
    });
  }
  beforeEach(function (done) {
    wipeDatabase(done);
  });

  it('should redirect to screencast', function (done) {
    var LINK = 'https://www.youtube.com/watch?v=XuLRKMqozwA';
    request(server)
      .post('/screencasts')
      .send({
        link: LINK,
        tags: 'JavaScript, Node, MySQL'
      })
      .expect(201)
      .expect({
        message: 'Thank you for your submission. Your submission will be reviewed by the moderators and if it meets our guidelines, it\'ll appear on the home page soon!'
      })
      .end(function (error, response) {
        request(server)
          .get('/screencasts/' + response.body.screencastId)
          .expect('Location', LINK)
          .expect(302, done);
      });
  });

  it('should send 404 if screencast is nonexistent', function (done) {
    request(server)
      .get('/screencasts/100')
      .expect(404, done);
  });
});
