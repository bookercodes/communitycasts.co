app.controller('homeController', function ($scope, $http) {
  $scope.page = 1;
  $scope.screencasts = [];
  $scope.sortOption = 'today';
  $scope.hasMore = true;
  $scope.busy = false;
  $scope.fetchScreencasts = function () {
    $scope.busy = true;
    var base = 'http://localhost:3000/screencasts';
    var url = base + '/top/' + $scope.sortOption + '?page=' + $scope.page;
    $http.get(url).success(function (response) {
      $scope.busy = false;
      $scope.page += 1;
      $scope.hasMore = response.hasMore;
      $scope.screencasts = $scope.screencasts.concat(response.screencasts);
    });
  };
  $scope.changeSortOption = function () {
    $scope.screencasts = [];
    $scope.page = 1;
    $scope.hasMore = true;
    $scope.busy = false;
    $scope.fetchScreencasts();
  };
  $scope.fetchScreencasts();
});
