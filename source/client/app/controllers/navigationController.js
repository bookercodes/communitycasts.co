app.controller('navigationController', function($scope, $http) {

  $scope.tagLimit = 2;

  $http.get('http://localhost:3000/tags').success(function(response) {
    $scope.tags = response.tags;
  });
});
