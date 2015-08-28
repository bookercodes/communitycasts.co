app.controller('menuController', function($scope, modal) {
  'use strict';
  $scope.showAddAlert = function(ev) {
    modal.show(ev);
  };
});
