
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
    x: 0,
    y: 0,
    x2: 0,
    y2: 0,
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
   * Mouse & Touch event handlers
   * @param {array} event     Mouse event
   * @return {boolean} Success
   */
  function mouseTrack (event) {
    var self = this,
      eventPos = event,
      offset = dom.canvas.control.offset(),
      x, y;
    // Conversion for touch events as needed
    eventPos = (event.originalEvent.touches && event.originalEvent.touches.length) ? event.originalEvent.touches[0] : event;
    if (typeof eventPos.pageX != 'undefined') {
      x = grid.getX(eventPos.pageX - offset.left),
      y = grid.getY(eventPos.pageY - offset.top);
    } else {
      x = selection.x2;
      y = selection.y2;
    }

    dom.header.text('Event: ' + event.type + ', coord: '+x+','+y);
    switch (event.type) {
      case 'mousedown':
      case 'touchstart':
        // Mouse button is down
        selection.y = y;
        selection.x = x;
        selection.selecting = true;
        // Turn on hover tracking
        dom.canvas.control.on('mousemove touchmove', function(event) {
          mouseTrack(event);
        });
        break;

      case 'mousemove':
      case 'touchmove':
        // Handle mouse hovering
        if (selection.x2 != x || selection.y2 !=y) {
          selection.x2 = x;
          selection.y2 = y;
          // console.log('Hover: '+x+','+y);
          grid.highlightLine( grid.getLine(selection.y, selection.x, y, x));
        }
        break;

      case 'mouseup':
      case 'touchend':
        // Mouse button released
        selection.selecting = false;
        dom.canvas.control.off('mousemove touchmove'); // release hover event
        // if doubleclicked, toss out
        if (selection.x == x && selection.y == y) {
          return false;
        }
        var line = grid.getLine(selection.y, selection.x, y, x);
        // now check word
        checkSelection( line.y, line.x, line.y2, line.x2 );
        grid.clearControl();
        break;
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
        grid.highlightBoard(line);
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
    grid.highlightBoard(words[word].line);
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
  dom.wf.html('<div class="header"></div><div class="gridboard"></div><div class="words"><p>Click on word to reveal its location</p></div>');
  dom.grid = dom.wf.find('.gridboard');
  dom.grid.html('<canvas class="board"></canvas><canvas class="control"></canvas>')
  dom.canvas = {
    board : dom.grid.find('.board'),
    control : dom.grid.find('.control')
  };
  dom.words = dom.wf.find('.words');
  dom.header = dom.wf.find('.header');

  // Init grid
  grid = new GridBoard(dom.canvas.board, dom.canvas.control, config.width, config.height);

  // Load words
  for (w in config.words) {
    loadWord(config.words[w]);
  }
  // Render Grid
  grid.render();

  // Apply Event handlers to DOM
  // Track mouseclicks on board

  dom.canvas.control.on('mousedown mouseup touchstart touchend', function(event) {
    event.preventDefault();
    mouseTrack(event);
  });

  // Track clicks on the word list
  dom.words.find('li').on('click touchend', function(e){
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
