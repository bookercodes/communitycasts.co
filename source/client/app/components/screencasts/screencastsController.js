(function() {
  'use strict';
  var screencastsController = function($scope, $http, $stateParams, $window,
    $location, config) {
    $scope.loadBtnText = 'Load More';

    function init() {
      $scope.page = 1;
      $scope.screencasts = [];
      $scope.hasMore = true;
      $scope.loaded = false;
      $scope.busy = false;
    }
    $scope.fetchScreencasts = function() {
      $scope.busy = true;
      var base = config.serverHost + 'api/screencasts';
      if ($stateParams.tagged !== '') {
        base += '/tagged/' + encodeURIComponent($stateParams.tagged) +
          '/';
      }
      var url = base + '?page=' + $scope.page + '&sort=' + $scope.sortOption;
      $http.get(url).success(function(response) {
        if ($scope.page === 1) {
          $scope.totalCount = response.totalCount;
        }
        $scope.busy = false;
        $scope.page += 1;
        $scope.hasMore = response.hasMore;
        $scope.screencasts = $scope.screencasts.concat(response.screencasts);
        $scope.loaded = true;
        if (!$scope.hasMore) {
          $scope.loadBtnText =
            'There are no more screencasts to load.';
        }
      });
    };
    $scope.changeSortOption = function() {
      init();
      $scope.fetchScreencasts();
    };
    $scope.navigateTo = function(link) {
      $window.open(link);
    };

    $scope.search = function () {
      $http.get(config.serverHost + 'screencasts/search/' + $scope.searchQuery)
        .success(function (response) {
          $scope.screencasts = response;
        });
    };

    init();
    $scope.sortOption = $stateParams.sort;
    $scope.tagged = $stateParams.tagged;
    $scope.fetchScreencasts();
  };
  screencastsController.$inject = ['$scope', '$http', '$stateParams',
    '$window', '$location', 'config', '$state'
  ];
  angular
    .module('communityCasts')
    .controller('screencastsController', screencastsController);
})();
