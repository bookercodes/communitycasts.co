app.controller('menuController', function($scope, $http, modal) {
  'use strict';
  $http.get('http://localhost:3000/tags').success(function(response) {
    $scope.tags = response.tags;
  });
  $scope.showAddAlert = function(ev) {
    modal.show(ev);
  };
});
