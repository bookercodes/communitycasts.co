var plan = require('flightplan');

var appName = 'community_casts';
var username = 'deploy';
var startFile = 'app.js';

var tmpDir = appName+'-' + new Date().getTime();

plan.target('production', [
  {
    host: '178.62.68.162',
    username: username,
    agent: process.env.SSH_AUTH_SOCK
  }
]);

plan.local(function(local) {
  local.log('Copy files to remote hosts');
  var filesToCopy = local.exec('git ls-files', {silent: true});
  local.transfer(filesToCopy, '/tmp/' + tmpDir);
});

plan.remote(function(remote) {
  remote.log('Move folder to root');
  remote.sudo('cp -R /tmp/' + tmpDir + ' ~', {user: username});
  remote.rm('-rf /tmp/' + tmpDir);

  remote.log('Install dependencies');
  remote.sudo('npm --production --prefix ~/' + tmpDir + ' install ~/' + tmpDir, {user: username});

  remote.log('Reload application');
  remote.sudo('ln -snf ~/' + tmpDir + ' ~/'+appName, {user: username});
});