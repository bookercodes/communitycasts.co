angular.module('config',[])
  .constant('config', {
    serverHost: 'http://localhost:8080/'
  });

var app = angular.module('communityCasts', ['ngMaterial', 'ui.router', 'config'])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/');
    $stateProvider.state('about', {
      url: '/about',
      templateUrl: '/app/views/_about.html',
      data : {
        pageTitle: 'About Community Casts'
      }
    });
    $stateProvider.state('home', {
      url: '/:tagged?',
      templateUrl: '/app/views/_screencasts.html',
      controller: 'screencastsController',
      params: {
        sort: 'popular',
        tagged: '',
      },
      data : {
        pageTitle: 'Community Casts'
      }
    });
  }])
  .run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  }]);

app.controller('heroController', ['$scope', 'modal', function($scope, modal) {
  'use strict';
  $scope.submitScreencast = function(ev) {
    modal.show(ev);
  };
}]);

app.controller('menuController', ['$scope', '$http', 'modal', '$location', 'config', function($scope, $http, modal, $location, config) {
  'use strict';
  $http.get(config.serverHost + 'tags').success(function(response) {
    $scope.tags = response.tags;
  });
  $scope.showAddAlert = function(ev) {
    modal.show(ev);
  };
}]);

app.controller('screencastsController', ['$scope', '$http', '$stateParams', '$window', '$location', 'config', function($scope, $http, $stateParams, $window, $location, config) {
  'use strict';
  $scope.loadBtnText = "Load More";
  function init() {
    $scope.page = 1;
    $scope.screencasts = [];
    $scope.hasMore = true;
    $scope.loaded = false;
    $scope.busy = false;
  }

  $scope.fetchScreencasts = function() {
    $scope.busy = true;

    var base = config.serverHost + 'screencasts';
    if ($stateParams.tagged !== '') {
      base += '/tagged/' + encodeURIComponent($stateParams.tagged) + '/';
    }
    var url = base + '?page=' + $scope.page + '&sort=' + $scope.sortOption;
    $http.get(url).success(function(response) {
      // do not update the totalCount on every request in case a new screencast
      // is added
      if ($scope.page === 1) {
        $scope.totalCount = response.totalCount;
      }
      $scope.busy = false;
      $scope.page += 1;
      $scope.hasMore = response.hasMore;
      $scope.screencasts = $scope.screencasts.concat(response.screencasts);
      $scope.loaded = true;
      if (!$scope.hasMore) {
        $scope.loadBtnText = 'Showing ' + $scope.screencasts.length + ' of ' + $scope.screencasts.length + ' screncasts. There are no more to load.';
      }
    });
  };

  $scope.changeSortOption = function() {
    init();
    $scope.fetchScreencasts();
  };

  $scope.navigateTo = function (link) {
    $window.open(link);
  };

  init();

  $scope.sortOption = $stateParams.sort;

  $scope.tagged = $stateParams.tagged;

  $scope.fetchScreencasts();
}]);

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
