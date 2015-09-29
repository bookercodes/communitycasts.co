(function() {
	'use strict';

 var app = angular
 	 .module('communityCasts', [
			'config',
			'ui.router',
			'smoothScroll',
			'ngMaterial',
			'ngMessages',
			'angulartics',
			'angulartics.google.analytics',
			'ui.router.title'
		]);
	app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
			$locationProvider.html5Mode(true);
			$urlRouterProvider.otherwise('/');
			$stateProvider.state('about', {
				url: '/about',
				templateUrl: '/app/components/about/_about.html',
				resolve: {
	      $title: function() { return 'About'; }
	    }
			});
			$stateProvider.state('submit', {
				url: '/submit',
				templateUrl: '/app/components/submit/_submit.html',
				controller: 'submitController',
				resolve: {
	      $title: function() { return 'Submit'; }
	    }
			});
			$stateProvider.state('tagged', {
				url: '/tagged/:tagged',
				templateUrl: '/app/components/screencasts/_screencasts.html',
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
				templateUrl: '/app/components/screencasts/_screencasts.html',
				controller: 'screencastsController',
				params: {
					sort: 'popular',
					tagged: '',
				}
			});
			$stateProvider.state('search', {
				url: '/search/:query',
				templateUrl: '/app/components/screencasts/_screencasts.html',
				controller: 'screencastsController',
				params: {
					sort: 'popular',
					tagged: '',
					query: ''
				}
			});
		}
	]);
})();
