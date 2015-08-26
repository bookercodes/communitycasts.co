app.controller('menuController', function ($scope, $http) {
  'use strict';
  $http.get('http://localhost:3000/tags').success(function(response) {
    $scope.tags = response.tags;
  });
});
