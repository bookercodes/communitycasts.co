app.controller('menuController', function($scope, $http, $mdDialog) {
  'use strict';
  $http.get('http://46.166.186.247:34709/tags').success(function(response) {
    $scope.tags = response.tags;
  });
  $scope.showAddAlert = function(ev) {
    $mdDialog.show(
      $mdDialog.alert()
      .title('Sorry')
      .content('Community Casts is not currently accepting submissions. ')
      .ok('OK :(')
      .targetEvent(ev));
  };
});
