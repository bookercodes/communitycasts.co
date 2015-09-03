app.controller('submitController', ['$scope', '$http', function($scope, $http) {
  'use strict';

  $scope.screencast = {};
  $scope.screencast.tags = [];

  $scope.submit = function () {
    var copy = $scope.screencast;
    copy.tags = copy.tags.join();
    $http.post('/screencasts', copy).then(function () {
      alert('yay');
    });
  };

}]);
