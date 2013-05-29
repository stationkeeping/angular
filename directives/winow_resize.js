// Watch the window for resize. Can be added to any tag.
angular.module('unwalked.directives').directive('windowResize', ['$window', function ($window) {

    return {

      link: function(scope, iElement, iAttrs) {

        function windowResizedHandler() {
          // Works scope.windowResized($window.innerWidth, $window.innerHeight);
          scope.$apply(function(scope){
            scope[iAttrs.windowResize]($window.innerWidth, $window.innerHeight);
          });

        }
        angular.element($window).bind('resize', windowResizedHandler);
        // Trigger immediately so we get the initial dimensions
        windowResizedHandler();
      }
    };
  }]);