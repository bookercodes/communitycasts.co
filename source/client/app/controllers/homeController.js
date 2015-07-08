app.controller('homeController', function ($scope, $http) {


  $http.get('http://localhost:3000/screencasts').success(function (data) {
    $scope.screencasts = data;
  });

  // $scope.message = 'Hello, World!';


});
