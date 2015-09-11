(function() {
  'use strict';
  var menuController = function($scope, $http, $location, config) {
    $http.get(config.serverHost + 'api/tags').success(function(response) {
      $scope.tags = response.tags;
    });
    $scope.custom = true;
    $scope.toggleCustom = function() {
      $scope.custom = $scope.custom === false ? true : false;
    };
  };
  menuController.$inject = ['$scope', '$http', '$location', 'config'];
  angular
    .module('communityCasts')
    .controller('menuController', menuController);
})();
