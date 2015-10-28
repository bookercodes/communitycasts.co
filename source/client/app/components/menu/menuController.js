(function() {
  'use strict';
  var menuController = function($scope, $http, $location, config, $mdDialog) {
    $http.get(config.serverHost + 'api/tags').success(function(response) {
      $scope.tags = response.tags;
    });
    $scope.menuVisible = false;
    $scope.toggleMenu = function() {
      $scope.menuVisible = !$scope.menuVisible;
    };
    $scope.renderAboutDialog = function(ev) {
      $mdDialog.show({
        //controller: DialogController,
        templateUrl: '/app/components/about/_about.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };
  };
  menuController.$inject = ['$scope', '$http', '$location', 'config', '$mdDialog'];
  angular
    .module('communityCasts')
    .controller('menuController', menuController);
})();
