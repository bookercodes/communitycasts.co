'use strict';

var Code = require('code');
var request = require('supertest');
var server = require('../server');
var expect = Code.expect;

function cleanDatabase(done) {
  var mysql = require('mysql');
  var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'communityCasts'
  });
  connection.connect();
  /* jshint multistr:true*/
  var query = '\
  SET FOREIGN_KEY_CHECKS=0; \
  TRUNCATE TABLE screencasts; \
  TRUNCATE TABLE tags; \
  TRUNCATE TABLE screencastTags; \
  TRUNCATE TABLE referrals; \
  SET FOREIGN_KEY_CHECKS=1;';
  connection.query(query, function () {
    done();
  });
}

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
  it('should return error if there are more than 5 tags', function (done) {
    var screencast = { link: 'https://www.youtube.com/watch?v=9bZkp7q19f0', tags: 'one,two,three,four,five,toomany'};
    request(server)
      .post('/screencasts')
      .send(screencast)
      .expect(400)
      .expect({ message: 'You must specify 5 or less tags.'}, done);
  });
  it('should return 201 on success', function (done) {
    var screencast = {
      link: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      tags: 'JavaScript, Node, MySQL'
    };
    request(server)
      .post('/screencasts')
      .send(screencast)
      .expect(201)
      .end(function (error, response) {
        expect(error).to.be.null();
        expect(response.body.message).to.match(/^Thank you for your submission.*it'll appear on the home page soon!$/);
        expect(response.body.screencastId).to.be.a.number();
        done();
      });
  });

});

describe('redirectToScreencast()', function () {

  beforeEach(cleanDatabase);

  it('should redirect to screencast after submission', function (done) {
    var screencast = {
      link: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      tags: 'JavaScript, Node, MySQL'
    };
    request(server)
      .post('/screencasts')
      .send(screencast)
      .end(function (error, response) {
        request(server)
          .get('/screencasts/' + response.body.screencastId)
          .expect('Location', screencast.link)
          .expect(302, done);
      });
  });



});
