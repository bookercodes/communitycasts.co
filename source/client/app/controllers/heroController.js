'use strict';

var heroController = function($scope, smoothScroll, $state) {
	$scope.scrollToScreencasts = function() {
		$state.go('home');
		smoothScroll(document.getElementById('container'));
	};
};
heroController.$inject = ['$scope', 'smoothScroll', '$state'];
app.controller('heroController', heroController);
