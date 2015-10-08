(function() {
  'use strict';
  var screencastsController = function($scope, screencasts, $stateParams, config) {
    $scope.page = 1;
    $scope.screencasts = [];
    $scope.screencastsLoaded = false;

    $scope.fetchScreencasts = function () {
      $scope.loadingScreencasts = true;
      $scope.tagged = $stateParams.tagged;
      var opts = {
        page: $scope.page,
        sort: $stateParams.sort,
        baseUrl: config.serverHost,
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
    $scope.fetchScreencasts();
  };
  screencastsController.$inject = [
    '$scope',
    'screencasts',
    '$stateParams',
    'config'
  ];
  angular.module('communityCasts')
    .controller('screencastsController', screencastsController);
})();
