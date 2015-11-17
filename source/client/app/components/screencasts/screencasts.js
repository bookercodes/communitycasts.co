(function () {
  'use strict';

  var screencasts = function($http, config) {

  function buildUrl(options) {
    var url = config.serverHost + 'api/screencasts';
    if (options.tagged !== '') {
      url += '/tagged/' + encodeURIComponent(options.tagged);
    }
    if (options.search) {
      url += '/search/' + encodeURIComponent(options.search);
    }
    url += '?page=' + options.page;
    url += '&sort=' + options.sort;
    return url;
  }

    return function(options) {
      return $http.get(buildUrl(options));
    };
  };
  screencasts.$inject = [
    '$http',
    'config'
  ];
  angular.module('communityCasts')
    .service('screencasts', screencasts);
})();
