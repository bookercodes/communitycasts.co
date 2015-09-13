(function() {
  'use strict';
  var heroController = function($scope, smoothScroll, $state) {
    $scope.scrollToScreencasts = function() {
      $state.go('home').then(function () {
        smoothScroll(document.getElementById('main'));
      });
    };
  };
  heroController.$inject = ['$scope', 'smoothScroll', '$state'];
  angular
    .module('communityCasts')
    .controller('heroController', heroController);
})();
