(function() {
  'use strict';
  var screencastController = function($scope, $stateParams, screencast) {
    $scope.playerVars = {
      enablejsapi: 1,
      autoplay: 1,
      theme: 'light',
      color: 'white',
      origin: 'communitycasts.co'
    };
    screencast($stateParams.screencastId).then(function(screencast) {
      $scope.screencast = screencast.data;
    });
  };
  screencastController.$inject = ['$scope', '$stateParams', 'screencast'];
  angular
    .module('communityCasts')
    .controller('screencastController', screencastController);
})();
