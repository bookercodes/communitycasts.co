app.controller('heroController', ['$scope', 'modal', function($scope, modal) {
  'use strict';
  $scope.submitScreencast = function(ev) {
    modal.show(ev);
  };
}]);
