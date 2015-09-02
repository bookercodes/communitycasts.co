app.factory('modal', ['$mdDialog', function ($mdDialog) {
  'use strict';
  return {
    show: function (ev) {
      $mdDialog.show(
        $mdDialog.alert()
        .title('Sorry')
        .content('Community Casts is not currently accepting submissions. ')
        .ok('Ok :(')
        .targetEvent(ev));
    }
  };
}]);
