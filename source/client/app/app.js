var app = angular.module('communityCasts', ['ui.router']);
app.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/?sort=popular');

  $stateProvider.state('about', {
    url: '/about',
    views: {
      'content': {
        templateUrl: '/app/views/about.html',
      },
      'navigation': {
        templateUrl: '/app/views/navigation.html',
        controller: 'navigationController'
      }
    },
  });

  $stateProvider.state('home', {
    url: '/:tagged?/?sort=',
    params: {
      'content': {
          sort: 'popular',
      }
    },
    views: {
      'content': {
        templateUrl: '/app/views/screencasts.html',
        controller: 'screencastsController'
      },
      'navigation': {
        templateUrl: '/app/views/navigation.html',
        controller: 'navigationController'
      }
    },
  });



});
