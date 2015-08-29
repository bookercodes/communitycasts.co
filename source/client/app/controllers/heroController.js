app.controller('heroController', function($scope, modal) {
  'use strict';
  $scope.submitScreencast = function(ev) {
    modal.show(ev);
  };
});
