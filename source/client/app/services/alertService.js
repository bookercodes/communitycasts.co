app.service('alert', function ($rootScope) {
  return function (title, message) {
    $rootScope.alert = {
      title: title,
      message: message
    };
  };
});
