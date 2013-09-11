/**
 *  ROWS, COLSS
 *  Y, X
 */

/**
 * This controls the use of the grid-based board that games can be played on
 * @constructor
 * @param {object} dom      DOM reference for board on page
 * @param {integer} height  Height in squares
 * @param {integer} width   Width in squares
 */
var GridBoard = function(board, control, width, height){

  var self = this,
    gridRows = [],
    cellSize = 30, // pixel height and width of cells
    hCellSize = cellSize / 2, // half cellSize
    tryCap = 500,
    pWidth = cellSize * width,
    pHeight = cellSize * height,
    lines = [],
    canvas = {};

  // Ensure ID is on page
  if (!board.length || !control.length) {
    throw new Exception('Board and Control must be defined DOM elements');
  }

  // Get canvas contexts
  canvas =  {
    board: board[0].getContext("2d"),
    control: control[0].getContext("2d")
  };

  /**
   * Clear contents of grid
   */
  function resetGrid() {
    var h, w, c;
    console.log('reseting grid');
    // load grid rows with blanks
    for (h = 0; h < height; h++) {
      gridRows[h] = [];
      for (w = 0; w < width; w++) {
        gridRows[h][w] = '';
      }
    }
    // reset of canvas
    board.attr({'height': 0, 'width': 0})
      .attr({'height': pHeight, 'width': pWidth});
    control.attr({'height': 0, 'width': 0})
      .attr({'height': pHeight, 'width': pWidth});

    // draw grid lines
    for (c = 0.5 + cellSize; c < pWidth; c += cellSize) {
      canvas.board.moveTo(c, 0);
      canvas.board.lineTo(c, pHeight);
    }
    for (c = 0.5 + cellSize; c < pHeight; c += cellSize) {
      canvas.board.moveTo(0, c);
      canvas.board.lineTo(pWidth, c);
    }
    canvas.board.strokeStyle = "rgba(0,0,0,.1)";
    canvas.board.stroke();

  }

  /**
   * Get random number
   */
  function getRand(min, max) {
    if (!max) {
      max = min;
      min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * What to put in blank spaces on the board
   */
  function getBlank() {
    // return '&nbsp;';
    return String.fromCharCode(getRand(65, 90));
  }

  /**
   * line object
   * @param {integer} x         x coordinate of line (0+)
   * @param {integer} y         y coordinate of line (0+)
   * @param {integer} direction Direction ID of line (0-7)
   * @param {integer} length    Length of line
   */
  function Line (y, x, direction, length) {
    y = y || 0;
    x = x || 0;
    d = direction || 0;
    var x2 = 0, y2 = 0, dx = 0, dy = 0;
    // figure out dy and dx
    switch (d) {
      case 0: dx = 0; dy = 1; break;
      case 1: dx = 1; dy = 1; break;
      case 2: dx = 1; dy = 0; break;
      case 3: dx = 1; dy = -1; break;
      case 4: dx = 0; dy = -1; break;
      case 5: dx = -1; dy = -1; break;
      case 6: dx = -1; dy = 0; break;
      case 7: dx = -1; dy = 1; break;
      default: throw new Exception ('Direction must be between 0 and 7.');
    }
    // figureout x2 and y2
    x2 = x + (dx * (length-1));
    y2 = y + (dy * (length-1));

    return { x: x, y: y, x2: x2, y2: y2, d: d, dx: dx, dy: dy, length: length };
  }

  /**
   * Initalization of grid
   */
  resetGrid();


  // public
  return {

    /**
     * Given a word, find a place for it to live on the board
     * @param {string} word     Word to place on board
     * @retrun {array} Coordinates of word (x, y, d)
     */
    loadWord: function(word) {
      var line, x, y, c, collision, letter, fits = false, loop = 0;

      // length check
      if (word.length >= width || word.length >= height) {
        throw new Exception('Word is too long for this grid.');
      }

      // loop until this word finds a home
      while (!fits) {
        line = new Line( getRand(height-1), getRand(width-1), getRand(7), word.length );
        loop++;

        // just putting brakes on this train
        if (loop > tryCap) {
          // console.log('BREAKING - too many tries');
          return false;
        }

        // check to see if we have a fit
        if (line.y2 >= height || line.y2 < 0 || line.x2 >= width || line.x2 < 0) {
          continue;
        }

        x = line.x;
        y = line.y;
        collision = false;
        // First loop through and detect collisions
        for (c = 0; c < word.length; c++) {
          if (gridRows[y][x] != '' && gridRows[y][x] != word.substring(c, c+1)) {
            collision = true;
          }
          x += line.dx;
          y += line.dy;
        }
        if (collision) {
          continue;
        }
        // Now we've confirmed all is well, add the letters
        x = line.x;
        y = line.y;
        for (c = 0; c < word.length; c++) {
          gridRows[y][x] = word.substring(c, c+1);
          x += line.dx;
          y += line.dy;
        }
        fits = true;

      }
      // console.log('FITS!!: Word:' + word + ' x:' + line.x + ' y:' + line.y + ' x2:' + line.x2 + ' y2:' + line.y2 + ' d: '+ line.d);
      return line;
    },

    /**
     * Render the existing board
     */
    render: function() {
      var self = this,
        h = 0, w = 0,
        letter, html = '',
        ph, pw;

      canvas.board.font = "bold 16px sans-serif";
      canvas.board.textAlign = "center";
      canvas.board.textBaseline = "middle";
      // Render canvas
      for (h = 0; h < height; h++) {
        ph = (height - h) * cellSize - (cellSize / 2);
        for (w = 0; w < width; w++) {
          pw = w * cellSize + (cellSize / 2);
          letter = (gridRows[h][w] || getBlank()).toUpperCase();
          canvas.board.fillText(letter, pw, ph);
        }
      }
    },

    /**
     * Highlight a line on the grid
     * @param {object} line       Line coordinates object
     * @param {string} className  Class to add to given line coordinates
     */
    highlightLine: function(line, className) {
      var self = this,
        cx = line.x,
        cy = pHeight - line.y,
        dcy = (0 - line.dy) * hCellSize;
        dcx = line.dx * hCellSize,
        c = {
          x: self.getCX(line.x),
          y: self.getCY(line.y),
          x2: self.getCX(line.x2),
          y2: self.getCY(line.y2)
        };
      console.log('Highlight Line: ', line);
      console.log('Canvas Coords: ' + c.x + ', ' + c.y)
      console.log('Coords: ' + (c.x + dcx) + ', ' + (c.y + dcy));
      canvas.control.beginPath();
      canvas.control.moveTo(c.x, c.y);
      canvas.control.lineTo(c.x2, c.y2);
      canvas.control.lineWidth = cellSize;
      canvas.control.strokeStyle = "rgba(240,240,120,.5)";
      canvas.control.lineCap = 'round';
      canvas.control.stroke();
    },

    /**
     * Given coords, get line
     * @param {integer} y         y coordinate of line (0+)
     * @param {integer} x         x coordinate of line (0+)
     * @param {integer} y2        y2 coordinate of line (0+)
     * @param {integer} x2        x2 coordinate of line (0+)
     * @return {object} Line object instance
     */
    getLine: function(y, x, y2, x2) {
      var self = this,
        line,
        dy = y2-y,
        dx = x2-x,
        d = 0,
        c = 0,
        length = Math.max( Math.abs(dy), Math.abs(dx) ) + 1;

      // I'd add line check but skipping now to save cycles
      if (dy > 0) {
        if (dx == 0) { d = 0; }
        if (dx > 0) { d = 1; }
        if (dx < 0) { d = 7; }
      } else if (dy < 0) {
        if (dx == 0) { d = 4; }
        if (dx > 0) { d = 3; }
        if (dx < 0) { d = 5; }
      } else {
        if (dx > 0) { d = 2; }
        if (dx < 0) { d = 6; }
      }
      return new Line(y, x, d, length);
    },

    /**
     * Given a canvax X coord, return grid X
     */
    getX: function(cx) {
      if (cx <= 0) { return 0; }
      if (cx >= pWidth) { return width-1; }
      return Math.floor(cx / cellSize);
    },

    /**
     * Given a canvax Y coord, return grid Y
     */
    getY: function(cy) {
      cy = pHeight - cy;
      if (cy <= 0) { return 0; }
      if (cy >= pHeight) { return height-1; }
      return Math.floor(cy / cellSize);
    },

    /**
     * Given a grid X, return canvas X
     */
    getCX: function(gx) {
      if (gx <= 0) { return hCellSize; }
      if (gx >= width) { return pWidth - hCellSize; }
      return (gx * cellSize) + hCellSize;
    },

    /**
     * Given a grid Y, return canvas Y
     */
    getCY: function(cy) {
      cy = height - cy;
      if (cy <= 0) { return hCellSize; }
      if (cy >= height) { return pHeight - hCellSize; }
      return (cy * cellSize) - hCellSize;
    },

    /**
     * Given coordinates, determine if they form a line - either diagonal, vertical or horizontal
     */
    isLine: function(y, x, y2, x2) {
      if (y == y2 || x == x2 || Math.abs(x - x2) == Math.abs(y - y2)) {
        return true;
      }
      return false;
    }

  };


};
