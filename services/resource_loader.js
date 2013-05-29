angular.module('unwalked.services').service('ResourceLoader',[ '$rootScope', 'loadQueue', function($rootScope, loadQueue) {

  // PreloadJS Queue, with XHR loading set to false
  this.queue = loadQueue;

  // Batch of items. By batching items, we can quickly cancel groups 
  // of items if they become irrellevent / lower priority, for example
  // maybe we are loading a gallery of images, but a visitor changes gallery.
  // In such a situation, we can cancel the batch of images from the old gallery
  // and load a batch of images from the new gallery
  this.currentBatch = null;
  this.loadedItems = [];
  var self = this;

  // Attach Events
  // complete, error, fileload, progress, and fileprogress

  this.loadBatch = function(batch, clearPrevious) {
    if(clearPrevious) {
      this.clearCurrentBatch();
    }

    this.currentBatch = batch;
    // Remove any items already loaded
    this.pruneBatch();
    if( this.queue ) {
      this.destroyQueue();
    }
    this.initialiseQueue();

    $.each(this.currentBatch, function(index, item) {
      self.loadItem(item, false);
    });

    this.queue.load();
  };

  this.clearCurrentBatch = function() {
    var self = this;
    if(this.currentBatch){
      $.each(this.currentBatch, function(index, item) {
        self.queue.remove(item);
      });
    }
  };

  this.loadItem = function(item, now) {
    if(typeof now === 'undefined') {
      now = true;
    }

    // Check if the item is in the queue or has already been loaded
    if( !this.itemLoadingOrLoaded(item)){
      this.queue.loadFile(item, now);
    }
  };

  // Event Handlers

  this.allLoaded = function() {
    // console.log("ALL LOADED");
    $rootScope.$broadcast('ResourceLoader::allLoaded');
  };

  this.queueProgressed = function(event) {
    //console.log("QUEUE PROGRESSED: "+event.progress);
    $rootScope.$broadcast('ResourceLoader::queueProgressed', event.progress);
  };

  this.fileProgressed = function(event) {
    // console.log("FILE PROGRESSED: "+event.item.src+" / "+event.progress);
    $rootScope.$broadcast('ResourceLoader::fileProgressed', event.item.id, event.progress);
  };

  this.fileLoaded = function(event) {
    //console.log("----------------------------------------------------");
    //console.log("FILE LOADED: "+event.item.src);
    //console.log("----------------------------------------------------");
    self.loadedItems.push(event.item);
    self.queue.remove(event.item.id);
    $rootScope.$broadcast('ResourceLoader::fileLoaded', event.item.id);
  };

  this.fileError = function(event) {
    // console.log("----------------------------------------------------");
    // console.log("FILE ERROR: "+event.item);
    // console.dir(event);
    // console.log("----------------------------------------------------");

    // Horrible hack for Safari
    // If we gt a blank error message back, we assume the problem was with Safari
    // and assume the file is already cached. We then treat the file as if it is loaded
    if(event.item && !event.error) {  
      self.fileLoaded(event);
    }
  };

  // Rearrange 
  this.prioritiseItem = function(item) {
    var self = this;
    var matchIndex = -1;
    var matchItem = null;

    // No need to prioritise if the item is already loaded
    // TODO: Check if item is currently loading as well
    if(this.itemLoaded(item)) {
      return false;
    }

    // Check the current batch contains the item
    $.each(this.currentBatch, function(index, batchItem) {
        if(self.compareLoadItems(item, batchItem)) {
          matchIndex = index;
          matchItem = batchItem;
          return false;
        }
      });

    if(matchItem) {
      // Move the item to the front of the que so that it is loaded first
      this.currentBatch = this.currentBatch.splice(matchItem);
      this.currentBatch.unshift(matchItem);
      this.loadBatch(this.currentBatch);
    }

  };

  // Utility

  this.pruneBatch = function() {
    var self = this;

    // Remove all loaded items from the batch
    this.currentBatch = $.grep(this.currentBatch, function (item) {
      var match = false;
      $.each(self.loadedItems, function(index, loadedItem) {
        if(self.compareLoadItems(item, loadedItem)) {
          match = true;
          return false;
        }
      });
      return match;
    }, true);
  };

  this.itemLoadingOrLoaded = function(item) {
    // Is the item loaded
    if(this.itemLoaded(item)) {
      return true;
    }

    // If it isn't loaded, is the item currently queued?
    return this.queue.getItem(item.id);
  };

  this.itemLoaded = function(item) {
    var self = this;
    // Is the item already loaded?
    var match = false;
    $.each(this.loadedItems, function(index, loadedItem) {
      if(self.compareLoadItems(item, loadedItem)) {
        match = true;
        return false;
      }
    });
    return match;
  };

  this.compareLoadItems = function(a, b) {
    return a.id === b.id && a.url === b.url;
  };

  this.initialiseQueue = function(){
    this.queue = new createjs.LoadQueue();
    this.queue.addEventListener('complete', this.allLoaded);
    this.queue.addEventListener('fileprogress', this.fileProgressed);
    this.queue.addEventListener('fileload', this.fileLoaded);
    this.queue.addEventListener('progress', this.queueProgressed);
    this.queue.addEventListener('error', this.fileError);
  };

  this.destroyQueue = function(){
    this.queue.removeAll();
    this.queue.reset();
    this.queue.removeEventListener('complete', this.allLoaded);
    this.queue.removeEventListener('fileprogress', this.fileProgressed);
    this.queue.removeEventListener('fileload', this.fileLoaded);
    this.queue.removeEventListener('progress', this.queueProgressed);
    this.queue.removeEventListener('error', this.fileError);
  };

}]);