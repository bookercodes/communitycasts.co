(function() {
  'use strict';
  var aboutController = function($scope, $mdDialog) {
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
  };
  aboutController.$inject = ["$scope", "$mdDialog"];
  angular
    .module('communityCasts')
    .controller('aboutController', aboutController);
})();
