app.controller('menuController', function($scope, $http, modal) {
  'use strict';
  $http.get('http://46.166.186.247:34709/tags').success(function(response) {
    $scope.tags = response.tags;
  });
  $scope.showAddAlert = function(ev) {
    modal.show(ev);
  };
});
