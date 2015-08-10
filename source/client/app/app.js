var app = angular.module('communityCasts', ['ui.router']);
app.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/?sort=popular');

  $stateProvider.state('about', {
    url: '/about',
    templateUrl: '/app/views/about.html'
  });

  $stateProvider.state('submit', {
    url: '/submit',
    templateUrl: '/app/views/submit.html'
  });

  $stateProvider.state('home', {
    url: '/:tagged?/?sort=',
    templateUrl: '/app/views/screencasts.html',
    controller: 'screencastsController'
  });
});
