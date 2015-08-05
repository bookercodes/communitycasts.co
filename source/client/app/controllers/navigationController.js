app.controller('navigationController', function($scope, $http) {

  $http.get('http://localhost:3000/tags').success(function(response) {
    $scope.tags = response.tags;
  });
});
