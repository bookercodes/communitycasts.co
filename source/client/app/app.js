'use strict';

var app = angular.module('communityCasts', [
	'config',
	'ui.router',
	'smoothScroll',
	'ngMaterial',
	'ngMessages',
	'angulartics',
	'angulartics.google.analytics',
	'ui.router.title'
]);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
	function($stateProvider, $urlRouterProvider, $locationProvider) {
		$locationProvider.html5Mode(true);
		$urlRouterProvider.otherwise('/');
		$stateProvider.state('about', {
			url: '/about',
			templateUrl: '/app/views/_about.html',
			resolve: {
      $title: function() { return 'About'; }
    }
		});
		$stateProvider.state('submit', {
			url: '/submit',
			templateUrl: '/app/views/_submit.html',
			controller: 'submitController',
			resolve: {
      $title: function() { return 'Submit'; }
    }
		});
		$stateProvider.state('tagged', {
			url: '/tagged/:tagged',
			templateUrl: '/app/views/_screencasts.html',
			controller: 'screencastsController',
			params: {
				sort: 'popular',
				tagged: '',
			},
			resolve: {
				$title: ['$stateParams', function ($stateParams) {
					return $stateParams.tagged  + ' Screencasts';
				}]
			}
		});
		$stateProvider.state('home', {
			url: '/',
			templateUrl: '/app/views/_screencasts.html',
			controller: 'screencastsController',
			params: {
				sort: 'popular',
				tagged: '',
			}
		});
	}
]);
