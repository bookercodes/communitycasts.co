(function() {
  'use strict';
  var screencastsController = function($scope, screencasts, $stateParams, $state) {
    $scope.page = 1;
    $scope.screencasts = [];
    $scope.screencastsLoaded = false;

    $scope.fetchScreencasts = function () {
      $scope.loadingScreencasts = true;
      $scope.tagged = $stateParams.tagged;
      var opts = {
        page: $scope.page,
        sort: $stateParams.sort,
        tagged: $stateParams.tagged,
        search: $scope.searchQuery
      };
      screencasts(opts).then(function(response) {
        $scope.loadingScreencasts = false;
        $scope.screencastsLoaded = true;
        $scope.screencasts = $scope.screencasts.concat(response.data.screencasts);
        $scope.moreScreencastsToLoad = response.data.hasMore;
      });
    };
    $scope.fetchNextPage = function() {
      $scope.page += 1;
      $scope.fetchScreencasts();
    };
    $scope.search = function() {
      $scope.screencasts = [];
      $scope.fetchScreencasts();
    };
    $scope.renderScreencast = function (screencastId) {
      console.log(screencastId);
      $state.go('screencast', {screencastId: screencastId});
    };
    $scope.fetchScreencasts();
  };
  screencastsController.$inject = [
    '$scope',
    'screencasts',
    '$stateParams',
    '$state'
  ];
  angular.module('communityCasts')
    .controller('screencastsController', screencastsController);
})();
