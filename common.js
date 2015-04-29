var moment = require('moment');

module.exports.convertRecordsToLocals = function (records) {
  records.forEach(function(record) {
    record.technologies = record.technologies.split(',');
    record.duration = moment.duration(record.durationInSeconds, 'seconds').humanize();
    delete record.durationInSeconds;
  });
}