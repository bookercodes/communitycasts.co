app.controller('heroController', function($scope, modal) {
  'use strict';
  $scope.showAddAlert = function(ev) {
    modal.show(ev);
  };
});
