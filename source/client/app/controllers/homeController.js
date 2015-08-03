app.controller('homeController', function($scope, $http) {

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
    var url = base + '?page=' + $scope.page;
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
  $scope.sortOption = 'today';
  $scope.fetchScreencasts();
});
