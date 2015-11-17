(function() {
  'use strict';
  var screencastController = function($scope) {
    $scope.text = 'test';
  };
  screencastController.$inject = ['$scope'];
  angular
    .module('communityCasts')
    .controller('screencastController', screencastController);
})();
