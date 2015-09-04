app.controller('heroController', ['$scope','$anchorScroll', function($scope, $anchorScroll) {
  'use strict';
  $scope.scrollToScreencasts = function () {
    $anchorScroll('container');

  };
}]);
