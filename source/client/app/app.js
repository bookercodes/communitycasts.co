var app = angular.module('communityCasts', ['ngMaterial', 'ui.router']);

app.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider.state('home', {
    url: '/',
    templateUrl: '/app/views/_screencasts.html',
    controller: 'screencastsController'
  });
});
