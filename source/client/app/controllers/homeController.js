app.controller('homeController', function ($scope, $http) {
  $scope.page = 1;
  $scope.screencasts = [];
  $scope.sortOption = 'today';
  $scope.fetchScreencasts = function() {
    var base = 'http://localhost:3000/screencasts';
    var url = base + '/top/' + $scope.sortOption + '?page=' + $scope.page;
    $http.get(url).success(function (screencasts) {
      $scope.screencasts = $scope.screencasts.concat(screencasts);
      $scope.page += 1;
    });
  };
});
