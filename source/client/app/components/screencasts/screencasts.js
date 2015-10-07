(function () {
  'use strict';

  function buildUrl(options) {
    var url = options.baseUrl + 'api/screencasts';
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

  var screencasts = function($http) {
    return function(options, done) {
      return $http.get(buildUrl(options));
    };
  };
  screencasts.$inject = [
    '$http'
  ];
  angular.module('communityCasts')
    .service('screencasts', screencasts);
})();
