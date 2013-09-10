
/**
 * This is the Singleton, 1 per page, object that tracks and knows what is the Word Finder
 * @namespace
 */
var WF = {
  version: .1,

  /**
   * Configuration
   */
  config: {
    height: 20,
    width: 20,
    id: 'wordfinder'
  },

  /**
   * DOM pointers
   */
  dom: {
    wf: {}
  },

  /**
   * Grid object
   */
  grid: {},

  /**
   * Initialization - start the game
   * @param {array} config    Configuration for the WordFinder
   */
  init: function(config) {

    var self = this;
    self.config = $.extend(true, self.config, config);
    self.grid = new GridBoard(self.config.id, self.config.width, self.config.height);
    self.dom.wf = $('#'+self.config.id);


    self.grid.loadWord('astronaut');
    self.grid.loadWord('helper');
    self.grid.loadWord('touchdown');
    self.grid.loadWord('dietary');
    self.grid.loadWord('milkshake');
    self.grid.loadWord('marrow');
    self.grid.loadWord('crispy');
    self.grid.loadWord('fluffy');


    self.grid.render();
  },





  // I do this to avoid trailing commas. That's just me.
  end: 1
}
