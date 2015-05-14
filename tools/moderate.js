#!/usr/bin/env node

var promise  = require('bluebird');
var readline = require('readline');
var mysql    = require('mysql');
var prompt   = require('prompt');

promise.promisifyAll(require('mysql/lib/Connection').prototype);
promise.promisifyAll(prompt);

var terminal = readline.createInterface(process.stdin, process.stdout);
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'screencastHub',
  multipleStatements: true,
});
connection.connect();

console.log('Hello. Here are your options:')
console.log(' 1. Approve pending screencasts interactively \n 2. Define tag synonym')

terminal.question('Option: ', function(option) {
  if (option === '1') {
    approve();
  } else if (option === '2') {
    tagSynonym();
  } else {
    console.log('Invalid option.');
    process.exit(1);
  }
  terminal.close();
});

function tagSynonym() {
  terminal.question('Source tag: ', function(sourceTag) {
    terminal.question('Target tag: ', function(targetTag) {
      var param = { 
        sourceTagName: sourceTag, 
        targetTagName: targetTag 
      };
      connection.queryAsync('INSERT INTO tagSynonyms SET ?', param).then(function() {
        var query = 
          'UPDATE screencastTags \
           JOIN tagSynonyms \
             ON screencastTags.tagName = tagSynonyms.sourceTagName \
           SET \
             tagName = tagSynonyms.targetTagName; \
           DELETE \
           FROM tags \
           WHERE tagName NOT IN ( \
             SELECT tagName \
             FROM screencastTags \
             WHERE screencastTags.tagName = tags.tagName)';
        connection.queryAsync(query).then(function() {
          console.log('Added synonym and applied mapping.');
          process.exit(0);
        })
      });
    });
  });
}

var property = {
  name: 'approve',
  message: 'approve this screencast?',
  validator: /y[es]*|n[o]?/,
  warning: 'Must respond yes or no',
  default: 'yes'
};

function approve() {
  prompt.start();
  connection.queryAsync('SELECT * FROM screencasts WHERE status = \'pending\'').spread(function(screencasts) {
  var current = promise.resolve();
  promise.map(screencasts, function(screencast) {
    current = current.then(function() {
      console.log('Title: "' + screencast.title + '".');
      return prompt.getAsync(property);
    }).then(function(result) {
      if (result.approve === 'yes') {
        connection.queryAsync('UPDATE screencasts SET status = \'approved\' WHERE screencastId = ?', screencast.screencastId)
      } else {
        connection.queryAsync('UPDATE screencasts SET status = \'denied\' WHERE screencastId = ?', screencast.screencastId);
      }
    });
    return current;
  });
});
}