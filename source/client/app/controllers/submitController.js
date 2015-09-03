app.controller('submitController', ['$scope', function($scope) {
  'use strict';
  $scope.screencast = {};
  $scope.screencast.tags = ['Angular'];

  $scope.submit = function () {
    alert(JSON.stringify($scope.screencast));
  };

}]);
