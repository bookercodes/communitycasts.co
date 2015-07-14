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
  it('should store should return 201', function (done) {
    request(server)
      .post('/screencasts')
      .send({
        link: 'https://www.youtube.com/watch?v=XuLRKMqozwA',
        tags: 'JavaScript, Node, MySQL'
      })
      .expect(201)
      .expect({
        message: 'Thank you for your submission. Your submission will be reviewed by the moderators and if it meets our guidelines, it\'ll appear on the home page soon!'
      }, done);
  });

  it('should return 400', function (done) {
    request(server)
      .post('/screencasts')
      .send({
        link: 'http://youtube.com/',
        tags: 'JavaScript'
      })
      .expect(400)
      .expect({
        message: 'Please enter a valid YouTube or Vimeo video url.'
      }, done);
  });

  it('should store screencast in db', function (done) {
    request(server)
      .post('/screencasts')
      .send({
        link: 'https://www.youtube.com/watch?v=XuLRKMqozwA',
        tags: 'JavaScript, Node, MySQL'
      })
      .expect(201)
      .end(function (error) {
        if (error) {
          throw error;
        }
        connection.query('SELECT screencastId FROM screencasts WHERE link = ?', 'https://www.youtube.com/watch?v=XuLRKMqozwA', function (error, result) {
          result.length.should.be.above(0);
          done();
        });
      });
  });


});
