#!/usr/bin/env node

var readline = require('readline');
var promise = require('bluebird');
var prompt = require('prompt');
var mysql   = require('mysql');

var terminal = readline.createInterface(process.stdin, process.stdout);

// promise.promisifyAll(prompt);

promise.promisifyAll(require('mysql/lib/Connection').prototype);

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'screencastHub',
  multipleStatements: true,
});
connection.connect();

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
      connection.queryAsync(query);
    });
  });
});


// prompt.start();

// var property = {
//   name: 'approve',
//   message: 'approve this screencast?',
//   validator: /y[es]*|n[o]?/,
//   warning: 'Must respond yes or no',
//   default: 'yes'
// };


// function process(screencastId, approve) {
//   if (approve) {
//     connection.queryAsync('UPDATE screencasts SET status = \'approved\' WHERE screencastId = ?', screencastId);
//   } else {
//     connection.queryAsync('UPDATE screencasts SET status = \'denied\' WHERE screencastId = ?', screencastId);
//   }
// }

// connection.queryAsync('SELECT * FROM screencasts WHERE status = \'pending\'').spread(function(screencasts) {
//   var current = promise.resolve();
//   promise.map(screencasts, function(screencast) {
//     current = current.then(function() {
//       console.log('Title: "' + screencast.title + '".');
//       return prompt.getAsync(property);
//     }).then(function(result) {
//       process(
//         screencast.screencastId, 
//         result.approve === 'yes')
//     });
//     return current;
//   });
// });