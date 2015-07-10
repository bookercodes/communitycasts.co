app.controller('submitController', function ($scope, $http, alert) {
  $scope.submitScreencast = function () {
    var url = 'http://localhost:3000/screencasts';
    $http.post(url, $scope.screencast).success(function onSuccess() {
      alert('title', 'trace: onSuccess()');
    });
  };
});
