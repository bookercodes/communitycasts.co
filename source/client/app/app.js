var app = angular.module('communityCasts', ['ngMaterial', 'ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider.state('home', {
    url: '/',
    templateUrl: '/app/views/_screencasts.html',
    controller: 'screencastsController',
    params: {
      sort: 'popular',
      tagged: '',
    },
  });
  $stateProvider.state('about', {
    url: '/about',
    templateUrl: '/app/views/_about.html'
  });
});
