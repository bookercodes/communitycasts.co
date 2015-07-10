app.controller('submitController', function ($scope, $http, alert, $state) {
  $scope.submitScreencast = function () {
    var url = 'http://localhost:3000/screencasts';
    $http.post(url, $scope.screencast)
      .success(function onSuccess(data) {
        alert('Success!', data.message);
        $state.go('home');
      })
      .error(function onError(data) {
        alert('Error!', data.message);
      });
  };
});
