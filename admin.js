var promise = require('bluebird');
var prompt = require('prompt');
var mysql   = require('mysql');
var async = require('async');

promise.promisifyAll(prompt);

promise.promisifyAll(require('mysql/lib/Connection').prototype);

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'screencastHub'
});
connection.connect();

prompt.start();

var property = {
  name: 'approve',
  message: 'approve this screencast?',
  validator: /y[es]*|n[o]?/,
  warning: 'Must respond yes or no',
  default: 'yes'
};


function process(screencastId, approve) {
  if (approve) {
    connection.queryAsync('UPDATE screencasts SET status = \'approved\' WHERE screencastId = ?', screencastId);
  }
}

connection.queryAsync('SELECT * FROM screencasts WHERE status = \'pending\'').spread(function(screencasts) {
  var current = promise.resolve();
  promise.map(screencasts, function(screencast) {
    current = current.then(function() {
      console.log('Title: "' + screencast.title + '".');
      return prompt.getAsync(property);
    }).then(function(result) {
      process(
        screencast.screencastId, 
        result.approve === 'yes')
    });
    return current;
  });
});