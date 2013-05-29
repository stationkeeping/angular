// Funtionality like a standard mouseEnter event, but with a configurable intent 
// timeout. Once the mouseEnter event is fired, an is started. If the mouseLeave
// event is fired before the interval, the timeout is cancelled. If not, the
// mouseEnteredWithIntent callback is fired. Useful for any UI that a user might,
// briefly interact with or move over whilst persuing another task; it ensures that
// the user indends the mouseEnter.
angular.module('unwalked.directives').directive('mouseenterWithIntent', [ '$window', '$timeout', function ($window, $timeout) {

  return {

    scope: true,

    link: function(scope, iElement, iAttrs) {

      var defaultDelay = 300;
      var isOver = false;
      var intentTimeout;
      // Default Delay
      var mouseenterDelay = iAttrs.mouseenterDelay || defaultDelay;

      // Delay has expired, showing the user's intent
      this.intentShown = function (scope, iElement, iAttrs) {
        // If the element is no longer in the array mouseleaveWithIntent has cancelled it
        if(isOver) {
          scope.$apply(iAttrs.onMouseenterWithIntent);
        }
      };

      function mouseLeft() {
        isOver = false;
        $timeout.cancel(intentTimeout);
        scope.$apply(iAttrs.onMouseleaveWithIntent);
      }

      function mouseEntered() {
        // Cancel previous timeout
        $timeout.cancel(intentTimeout);
        isOver = true;
        // Wait for user to prove intent
        intentTimeout = $timeout(function(){this.intentShown(scope, iElement, iAttrs);}, mouseenterDelay);
      }

      iElement.bind('mouseleave', mouseLeft);
      iElement.bind('mouseenter', mouseEntered);
    }
  };
}]);