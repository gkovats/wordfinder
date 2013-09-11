
/**
 * This is the Singleton, 1 per page, object that tracks and knows what is the Word Finder
 * @namespace
 */
var WordFinder = function(instanceConfig) {

  var version = 1,

  /**
   * selection Object - tracks what the user is selecting
   */
  selection = {
    y: 0,
    x: 0,
    selecting: false
  },

  /**
   * Configuration params with defaults
   */
  config = {
    height: 20, // height in grid squares
    width: 20, // width in grid squares
    id: 'wordfinder', // ID for wrapper DOM object
    words: [] // on init, this gets transferred to the words property
  },

  /**
   * DOM pointers object
   */
  dom = {
    wf: '', // whole wordfinder wrapper
    board: '', // board Dom element
  },

  /**
   * GridBoard instance
   */
  grid = {},

  /**
   * Collection of words
   */
  words = {};

  /**
   * Abstraction for grid's loadword
   */
  function loadWord (rawWord) {
    var self = this, line;
    word = rawWord.toLowerCase().replace(/\s/,'');
    line = grid.loadWord(word);

    if (!line) { return false; }
    words[word] = {
      line: line,
      found: false
    };
    // add word to words board
    dom.words.append('<li data-word="'+word+'">'+rawWord+'</li>');
    return true;
  };

  /**
   * Mouse event handlers
   * @param {array} event     Mouse event
   * @return {boolean} Success
   */
  function mouseTrack (event) {
    var self = this,
      offset = dom.board.offset(),
      x = grid.getX(event.pageX - offset.left),
      y = grid.getY(event.pageY - offset.top);

    if (event.type == 'mousedown') {
      // Mouse button is down
      selection.y = y;
      selection.x = x;
      selection.selecting = true;
      // Turn on hover tracking
      dom.board.on('mousemove', function(event) {
        mouseTrack(event);
      });
    } else if (event.type == 'mousemove' && selection.selecting) {
      // Handle mouse hovering
      grid.highlightLine( grid.getLine(selection.y, selection.x, y, x), 'hover' );
   } else if (event.type == 'mouseup' && selection.selecting) {
      // Mouse button released
      selection.selecting = false;
      dom.board.off('mousemove'); // release hover event
      // if doubleclicked, toss out
      if (selection.x == x && selection.y == y) {
        return false;
      }
      var line = grid.getLine(selection.y, selection.x, y, x);
      // now check word
      checkSelection( line.y, line.x, line.y2, line.x2 );
    }
    return true;
  }

  /**
   * Checks current selection to see if it's on a word
   *
   * @param {integer} y   Y coordinate
   * @param {integer} x   X coordinate
   * @param {integer} y2   Y2 coordinate
   * @param {integer} x2   X2 coordinate
   * @returns {boolean} Success
   */
  function checkSelection (y, x, y2, x2) {
    var self = this, w, word, line;

    for (word in words) {
      // skip found words
      if (words[word].found) { continue; }

      line = words[word].line;
      console.log('Checking word: '+ word, line);
      if ( (x == line.x && y == line.y && x2 == line.x2 && y2 == line.y2) ||
          (x2 == line.x && y2 == line.y && x == line.x2 && y == line.y2) ) {
        dom.header.html('<p>You found <b>' + word + '</b>!</p>');
        words[word].found = true;
        // highlight line on board
        grid.highlightLine(line, 'found');
        // cross off the word list
        dom.words.find('li[data-word='+word+']').addClass('found');
        return true;
      }
    }

    dom.header.html('<p class="no">Word not found there.</p>');
    return false;
  }

  /**
   * Reveals a word hidden on the board
   */
  function revealWord (wordRef) {
    var self = this, word = '';
    if (typeof wordRef == 'string') {
      word = wordRef;
    } else {
      word = $(wordRef).attr('data-word');
    }
    console.log(word);
    // If word doesn't exist or is found, skip
    if (!words[word] || words[word].found) {
      return false;
    }
    // mark word found and reveal it
    words[word].found = true;
    // highlight line on board
    grid.highlightLine(words[word].line, 'found');
    // cross off the word list
    dom.words.find('li[data-word='+word+']').addClass('found');
    return true;
  }

  // Initialization of WordFinder
  if (instanceConfig) {
    config = $.extend(true, config, instanceConfig);
  }

  // Set Dom pointers
  dom.wf = $('#'+config.id);
  dom.wf.addClass('wordfinder');
  // Build needed elements and then add DOM pointers
  dom.wf.html('<div class="header"></div><canvas class="board"></canvas><div class="words"><p>Click on word to reveal its location</p></div>');

  dom.board = dom.wf.find('canvas.board');
  dom.words = dom.wf.find('.words');
  dom.header = dom.wf.find('.header');

  // Init grid
  grid = new GridBoard(dom.board, config.width, config.height);

  // Load words
  for (w in config.words) {
    loadWord(config.words[w]);
  }
  // Render Grid
  grid.render();
  // dom.cells = dom.board.find('span');

  // Apply Event handlers to DOM
  // Track mouseclicks on board

  dom.board.on('mousedown mouseup', function(event) {
    mouseTrack(event);
  });

  // Track clicks on the word list
  dom.words.find('li').on('click', function(e){
    revealWord(this);
  });

  return {

    /**
     * Here's where the public methods go
     */
    // Clear board method
    // Load words method
    // Stop game
    // Get Score?
    // Reset / Reshuffle - reload current words

  }

};
