'use strict';

var sut = require('../util');
/*jshint unused:false*/
var should = require('should');

describe('split', function () {
  it('returns correct result', function () {
    sut.split('tag, tag').should.eql(['tag']);
    sut.split('tag').should.eql(['tag']);
    sut.split(' tag').should.eql(['tag']);
    sut.split(' tag  ').should.eql(['tag']);
    sut.split(',tag,').should.eql(['tag']);
    sut.split('tag, tag1').should.eql(['tag', 'tag1']);
    sut.split(' tag, tag1').should.eql(['tag', 'tag1']);
    sut.split(' tag,,  tag1').should.eql(['tag', 'tag1']);
    sut.split(',,').should.eql([]);
    sut.split(',,').should.eql([]);
  });
});
