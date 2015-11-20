(function() {
  'use strict';
  var menuController = function($scope, $http, $location, config, $mdDialog, smoothScroll, $state) {
    $http.get(config.serverHost + 'api/tags').success(function(response) {
      $scope.tags = response.tags;
    });
    $scope.menuVisible = false;
    $scope.toggleMenu = function() {
      $scope.menuVisible = !$scope.menuVisible;
    };
    $scope.renderAboutDialog = function(ev) {
      $mdDialog.show({
        controller: "aboutController",
        templateUrl: '/app/components/about/_about.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };
    $scope.renderSubmit =function () {
      smoothScroll(document.getElementById('main'));
      $state.go('submit');
    };
  };
  menuController.$inject = ['$scope', '$http', '$location', 'config', '$mdDialog', 'smoothScroll', '$state'];
  angular
    .module('communityCasts')
    .controller('menuController', menuController);
})();
