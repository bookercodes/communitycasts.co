app.controller('submitController', ['$scope', '$mdToast', '$http', '$state', function($scope, $mdToast, $http, $state) {
  'use strict';

  $scope.screencast = {};

  $scope.submit = function () {
    $http.post('/screencasts', $scope.screencast).then(function () {
      $mdToast.show(
        $mdToast.simple()
          .content('Thank you for your submission. Your submission will be reviewed by the moderators and if it meets our guidelines, it\'ll appear on the home page soon!')
          .position('top right')
          .hideDelay(3000)
      );
      $state.go('home');
    });
  };

}]);
