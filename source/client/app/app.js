var app = angular.module('communityCasts', ['ui.router']);
app.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider.state('main', {
    url: '/',
    templateUrl: '/app/views/home.html',
    controller: 'homeController'
  });
  $stateProvider.state('about', {
    url: '/about',
    templateUrl: '/app/views/about.html'
  });
  $stateProvider.state('submit', {
    url: '/submit',
    templateUrl: '/app/views/submit.html',
    controller: 'submitController'
  });
});
