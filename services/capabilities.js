// Beginings of clientside capabilty detection class.
// Image suffix is comprised of a size and a multiplier
// based on screen resolution (iOS style) such largex2

angular.module('unwalked.services').service('Capabilities', [ '$window', function($window) {

  this.filePostfix = '';

  // Custom Modernizr test
  this.hiDPI = window.Modernizr.highresdisplay;

  this.updateScreenDimensions = function(width, height) {
    // Cinema Display is 2560
    var size = '';
    if(width < 641) {
      size = 'small';
    } else if(width < 768) {
      size = 'medium';
    } else if(width < 1441) {
      size = 'large';
    }else {
      size = 'extra_large'; //Underscore deliberate to match Paperclip/Rails
    }

    // Postfix is comprised of size + multiplier, eg. mediumx2
    this.filePostfix = size + (this.hiDPI ? 'x2_url' : '_url');
  };

  // Update immediately upon instantiation
  // TODO: Safari reports screen-size of primary screen, even if window is on secondary screen
  this.updateScreenDimensions($window.screen.width, $window.screen.height);

}]);