(function() {
  'use strict';
  var submitController = function($scope, $mdToast, $http, $state) {
    $scope.screencast = {};
    $scope.submit = function() {
      $http.post('/api/screencasts', $scope.screencast).success(function() {
          $mdToast.show(
            $mdToast.simple()
            .content(
              'Thank you for your submission. Your submission will be reviewed by the moderators and if it meets our guidelines, it\'ll appear on the home page soon!'
            )
            .position('top right')
            .hideDelay(3000)
          );
          $state.go('home');
        })
        .error(function(error) {
          $scope.error = error.message;
        });
    };
  };
  submitController.$inject = ['$scope', '$mdToast', '$http', '$state'];
  angular
    .module('communityCasts')
    .controller('submitController', submitController);
})();
