// Watch an element for a style change
angular.module('unwalked.directives').directive('watchStyle', [function () {

  return {

    link: function(scope, iElement, iAttrs) {

      function styleChanged(newValue, oldValue) {
        if(newValue !== oldValue) {
          scope[iAttrs['watchStyle']](newValue);
        }
      }

      scope.$watch(function(){
        return iElement.css(iAttrs['watchedStyle']);
      },
      styleChanged,
      true);

      // Initial settings
      var initialValue = iElement.css(iAttrs['watchedStyle']);
      scope[iAttrs['watchStyle']](initialValue);
    }
  };

}]);