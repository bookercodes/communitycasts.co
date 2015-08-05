var app = angular.module('communityCasts', ['ui.router']);
app.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider.state('home', {
    url: '/',
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

  $stateProvider.state('submit', {
    url: '/submit',
    templateUrl: '/app/views/submit.html',
    controller: 'submitController'
  });
});
