app.controller('menuController', function($scope, $http, modal, $location, config) {
  'use strict';
  $http.get(config.serverHost + 'tags').success(function(response) {
    $scope.tags = response.tags;
  });
  $scope.showAddAlert = function(ev) {
    modal.show(ev);
  };
});
