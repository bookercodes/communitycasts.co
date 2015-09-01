var app = angular.module('communityCasts', ['ngMaterial', 'ui.router', 'config'])
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider.state('home', {
      url: '/',
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
    $stateProvider.state('about', {
      url: '/about',
      templateUrl: '/app/views/_about.html',
      data : {
        pageTitle: 'About Community Casts'
      }
    });
  })
  .run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  });
