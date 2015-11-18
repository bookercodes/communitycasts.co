/* globals YT */

(function() {
  'use strict';

  var youtube = function($window) {
    return {
      restrict: 'E',

      scope: {
        height: '@',
        width: '@',
        videoid: '@'
      },

      template: '<div></div>',

      link: function(scope, element) {
        var tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        var player;

        $window.onYouTubeIframeAPIReady = function() {
          player = new YT.Player(element.children()[0], {
            height: scope.height,
            width: scope.width,
            videoId: scope.videoid,
            playerVars: {
              autoplay: 1,
              html5: 1,
              theme: 'light',
              color: 'white',
              controls: 2
            }
          });
        };

        scope.$watch('videoid', function(newValue, oldValue) {
          if (newValue === oldValue) {
            return;
          }
          player.cueVideoById(scope.videoid);
        });

        scope.$watch('height + width', function(newValue, oldValue) {
          if (newValue === oldValue) {
            return;
          }
          player.setSize(scope.width, scope.height);
        });
      }
    };
  };

  youtube.inject = ['$window'];

  angular.module('communityCasts')
    .directive('youtube', youtube);
})();
