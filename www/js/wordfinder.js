
/**
 * This is the Singleton, 1 per page, object that tracks and knows what is the Word Finder
 * @namespace
 */
var WF = {
  version: .1,

  /**
   * selection Object
   */
  selection: {
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

  /**
   * Collection of words
   */
  words: {},

  /**
   * Initialization - start the game
   * @param {array} config    Configuration for the WordFinder
   */
  init: function(config) {

    var self = this;
    self.config = $.extend(true, self.config, config);

    self.dom.wf = $('#'+self.config.id);
    self.dom.board = self.dom.wf.find('.board');
    self.dom.words = self.dom.wf.find('.words');
    self.dom.header = self.dom.wf.find('.header');

    self.grid = new GridBoard(self.dom.board, self.config.width, self.config.height);

    self.loadWord('astronaut');
    self.loadWord('helper');
    self.loadWord('touchdown');
    self.loadWord('dietary');
    self.loadWord('milkshake');
    self.loadWord('marrow');
    self.loadWord('crispy');
    self.loadWord('fluffy');
    self.loadWord('freedom');
    self.loadWord('fantasy');
    self.loadWord('touchback');
    self.loadWord('tightend');
    self.loadWord('forward');
    self.loadWord('safety');
    self.loadWord('savings');
    self.loadWord('attached');
    self.loadWord('strings');
    self.loadWord('fray');
    self.loadWord('quarry');
    self.loadWord('yelling');


    console.log(self.words);

    self.grid.render();

    // Apply Event handlers to DOM
    // Track mouseclicks on board
    self.dom.board.on('mousedown mouseup', function(event) {
      self.mouseTrack(event);
    });
    // Track clicks on the word list
    self.dom.words.find('li').on('click', function(e){
      self.revealWord(this);
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
    // add word to words board
    self.dom.words.append('<li data-word="'+word+'">'+word+'</li>');
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
      self.selection.y = parseInt(matches[1]);
      self.selection.x = parseInt(matches[2]);
      self.selection.selecting = true;
    } else if (event.type == 'mouseup' && self.selection.selecting) {
      self.selection.y2 = parseInt(matches[1]);
      self.selection.x2 = parseInt(matches[2]);
      console.log(self.selection);
      self.selection.selecting = false;
      // if doubleclicked, toss out
      if (self.selection.x == self.selection.x2 && self.selection.y == self.selection.y2) {
        return false;
      }
      // now check word
      self.checkSelection( self.selection.y, self.selection.x, self.selection.y2, self.selection.x2 );
    }
    return true;
  },

  /**
   * Checks current selection to see if it's on a word
   *
   * @param {integer} y   Y coordinate
   * @param {integer} x   X coordinate
   * @param {integer} y2   Y2 coordinate
   * @param {integer} x2   X2 coordinate
   * @returns {boolean} Success
   */
  checkSelection: function (y, x, y2, x2) {
    var self = this, w, word, line;

    for (word in self.words) {
      // skip found words
      if (self.words[word].found) { continue; }

      line = self.words[word].line;
      console.log('Checking word: '+ word, line);
      if ( (x == line.x && y == line.y && x2 == line.x2 && y2 == line.y2) ||
          (x2 == line.x && y2 == line.y && x == line.x2 && y == line.y2) ) {
        self.dom.header.html('<p>You found ' + word + '!</p>');
        self.words[word].found = true;
        // highlight line on board
        self.grid.highlightLine(line);
        // cross off the word list
        self.dom.words.find('li[data-word='+word+']').addClass('found');
        return true;
      }
    }

    self.dom.header.html('<p class="no">Word not found there.</p>');
    return false;
  },

  /**
   * Reveals a word hidden on the board
   */
  revealWord: function (wordRef) {
    var self = this, word = '';
    if (typeof wordRef == 'string') {
      word = wordRef;
    } else {
      word = $(wordRef).attr('data-word');
    }
    console.log(word);
    // If word doesn't exist or is found, skip
    if (!self.words[word] || self.words[word].found) {
      return false;
    }
    // mark word found and reveal it
    self.words[word].found = true;
    // highlight line on board
    self.grid.highlightLine(self.words[word].line);
    // cross off the word list
    self.dom.words.find('li[data-word='+word+']').addClass('found');
    return true;
  },


  // I do this to avoid trailing commas. That's just me.
  end: 1
};
