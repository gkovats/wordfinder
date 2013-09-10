
/**
 * This is the Singleton, 1 per page, object that tracks and knows what is the Word Finder
 * @namespace
 */
var WF = {
  version: .1,

  /**
   * Status Object
   */
  status: {
    y: 0,
    x: 0,
    y2: 0,
    x2: 0,
    selecting: false
  },

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

  words: {},

  /**
   * Initialization - start the game
   * @param {array} config    Configuration for the WordFinder
   */
  init: function(config) {

    var self = this;
    self.config = $.extend(true, self.config, config);
    self.grid = new GridBoard(self.config.id, self.config.width, self.config.height);
    self.dom.wf = $('#'+self.config.id);

    self.loadWord('astronaut');
    self.loadWord('helper');
    self.loadWord('touchdown');
    self.loadWord('dietary');
    self.loadWord('milkshake');
    self.loadWord('marrow');
    self.loadWord('crispy');
    self.loadWord('fluffy');
    self.loadWord('freedom');
    self.loadWord('savings');
    self.loadWord('attached');
    self.loadWord('strings');
    self.loadWord('fray');
    self.loadWord('quarry');
    self.loadWord('yelling');


    self.grid.render();

    self.dom.wf.on('mousedown mouseup', function(event) {
      self.mouseTrack(event);
    });


  },


  /**
   * Abstraction for grid's loadword
   */
  loadWord: function(word) {
    var self = this, line;
    word = word.toLowerCase().replace(/\s/,'');
    line = self.grid.loadWord(word);

    if (!line) { return false; }
    self.words[word] = {
      line: line,
      found: false
    };
    return true;
  },

  /**
   * Mouse event handlers
   * @param {array} event     Mouse event
   * @return {boolean} Success
   */
  mouseTrack: function (event) {
    var self = this,
      id = event.target.id,
      matches = [];
    matches = id.match(/gb(\d+)-(\d+)/);
    if (!matches.length) {
      return false; // didn't click on a cell
    }

    if (event.type == 'mousedown') {
      self.status.y = parseInt(matches[1]);
      self.status.x = parseInt(matches[2]);
      self.status.selecting = true;
    } else if (event.type == 'mouseup' && self.status.selecting) {
      self.status.y2 = parseInt(matches[1]);
      self.status.x2 = parseInt(matches[2]);
      console.log(self.status);
      self.status.selecting = false;
    }
    return true;
  },

  // I do this to avoid trailing commas. That's just me.
  end: 1
}
