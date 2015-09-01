app.controller('menuController', function($scope, $http, modal, serverHost) {
  'use strict';
  $http.get(serverHost + 'tags').success(function(response) {
    $scope.tags = response.tags;
  });
  $scope.showAddAlert = function(ev) {
    modal.show(ev);
  };
});
