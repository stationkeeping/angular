// Simple service wrapper for PreloadJS LoadQueue
angular.module('unwalked.services').factory('loadQueue', function() {
    return new createjs.LoadQueue();
});