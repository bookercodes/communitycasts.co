(function () {
  'use strict';
  var screencast = function($http, config) {
    return function(screencastId) {
      return $http.get(config.serverHost + 'api/screencasts/' + screencastId);
    };
  };
  screencast.$inject = [
    '$http',
    'config'
  ];
  angular.module('communityCasts')
    .service('screencast', screencast);
})();
