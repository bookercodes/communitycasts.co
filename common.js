var moment = require('moment');
var request = require('request');

module.exports.convertRecordsToLocals = function (records) {
  records.forEach(function(record) {
    record.technologies = record.tags.split(',');
    record.duration = moment.duration(record.durationInSeconds, 'seconds').humanize();
    delete record.durationInSeconds;
  });
};