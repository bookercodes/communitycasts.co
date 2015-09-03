app.controller('menuController', ['$scope', '$http', '$location', 'config', function($scope, $http, $location, config) {
  'use strict';
  $http.get(config.serverHost + 'tags').success(function(response) {
    $scope.tags = response.tags;
  });
}]);
