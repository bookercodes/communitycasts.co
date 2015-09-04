app.controller('submitController', ['$scope', '$http', function($scope, $http) {
  'use strict';

  $scope.screencast = {};

  $scope.submit = function () {
    $http.post('/screencasts', $scope.screencast).then(function () {
      alert('yay');
    });
  };

}]);
