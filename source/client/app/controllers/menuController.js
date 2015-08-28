app.controller('menuController', function($scope, $http, modal) {
  'use strict';
  $http.get('http://85.159.237.3:34709/tags').success(function(response) {
    $scope.tags = response.tags;
  });
  $scope.showAddAlert = function(ev) {
    modal.show(ev);
  };
});
