app.controller('headerController', ['$scope', 'smoothScroll', '$state', function($scope, smoothScroll, $state) {
  'use strict';

  $scope.scrollToScreencasts = function () {
    $state.go('home');
    smoothScroll(document.getElementById('container'));
  };

}]);
