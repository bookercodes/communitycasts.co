(function() {
  'use strict';
  var menuController = function($scope, $http, $location, config) {
    $http.get(config.serverHost + 'api/tags').success(function(response) {
      $scope.tags = response.tags;
    });
    $scope.menuVisible = false;
    $scope.toggleCustom = function() {
      $scope.menuVisible = !$scope.menuVisible;
    };
  };
  menuController.$inject = ['$scope', '$http', '$location', 'config'];
  angular
    .module('communityCasts')
    .controller('menuController', menuController);
})();
