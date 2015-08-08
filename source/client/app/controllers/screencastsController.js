app.controller('screencastsController', function($scope, $http, $stateParams) {

  function init() {
    $scope.page = 1;
    $scope.screencasts = [];
    $scope.hasMore = true;
    $scope.loaded = false;
    $scope.busy = false;
  }

  $scope.fetchScreencasts = function() {
    $scope.busy = true;

    var base = 'http://localhost:3000/screencasts';
    if ($stateParams.tagged !== '') {
      base += '/tagged/' + $stateParams.tagged + '/';
    }
    var url = base + '?page=' + $scope.page + '&sort=' + $scope.sortOption;
    $http.get(url).success(function(response) {
      $scope.busy = false;
      $scope.page += 1;
      $scope.hasMore = response.hasMore;
      $scope.screencasts = $scope.screencasts.concat(response.screencasts);
      $scope.loaded = true;
    });
  };

  $scope.changeSortOption = function() {
    init();
    $scope.fetchScreencasts();
  };

  init();

  if ($stateParams.sort === 'latest') {
    $scope.sortOption = 'latest';
  } else {
    $scope.sortOption = 'popular';
  }

  $scope.tagged = $stateParams.tagged;

  $scope.fetchScreencasts();
});
