app.controller('homeController', function ($scope, $http) {
  $scope.page = 1;
  $scope.screencasts = [];
  $scope.sortOption = 'today';
  $scope.hasMore = true;
  $scope.busy = false;
  $scope.fetchScreencasts = function () {
    var base = 'http://localhost:3000/screencasts';
    var url = base + '/top/' + $scope.sortOption + '?page=' + $scope.page;
    $scope.busy = true;
    $http.get(url).success(function (body) {
      $scope.screencasts = $scope.screencasts.concat(body.screencasts);
      $scope.page += 1;
      if (!body.hasMore) {
        $scope.hasMore = false;
      }
      $scope.busy = false;
    });
  };
  $scope.fetchScreencasts();
});
