'use strict';

var mysql = require('mysql');
var request = require('supertest');
var should = require('should');

describe('screencasts api', function() {
  var screencasts = [{
    title: 'foo',
    durationInSeconds: '120',
  }, {
    title: 'bar',
    durationInSeconds: '180',
  }];
  before(function(done) {
    var connection = mysql.createConnection({
      password: '',
      host: 'localhost',
      user: 'root',
      database: 'communityCasts'
    });
    connection.connect();
    connection.query('DELETE FROM screencasts', function(error) {
      should.not.exist(error, 'Something went wrong when deleting the screencasts table.');
      var values = [screencasts.map(function(screencast) {
        return [screencast.title, screencast.durationInSeconds];
      })];
      connection.query('INSERT INTO screencasts(title, durationInSeconds) VALUES ?', values, function(error) {
        should.not.exist(error, 'Something went wrong when inserting test data.');
        done();
      });
    });
  });
  it('responds to a GET request with a Json response containing all the screencasts in database', function(done) {
    request('http://localhost:3000')
      .get('/screencasts')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(error, response) {
        if (error) {
          throw error;
        }
        response.body.length.should.equal(screencasts.length);
        for (var screencast in response.body) {
          response.body[screencast].title.should.equal(screencasts[screencast].title);
          response.body[screencast].durationInSeconds.toString().should.equal(screencasts[screencast].durationInSeconds);
        }
        done();
      });
  });

});
