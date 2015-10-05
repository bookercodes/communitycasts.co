(function () {
  'use strict';
  var screencasts = function ($resource, config) {
    return $resource(config.serverHost + 'api/screencasts');
  };
  screencasts.$inject = [
    '$resource',
    'config'
  ];
  angular.module('communityCasts')
    .service('screencasts', screencasts);
})();
