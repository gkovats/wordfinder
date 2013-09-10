/**
 *
 *  ROWS, COLSS
 *  Y, X
 *
 */

/**
 * This controls the use of the grid-based board that games can be played on
 * @constructor
 * @param {string} id       DOM ID for board on page
 * @param {integer} height  Height in squares
 * @param {integer} width   Width in squares
 */
var GridBoard = function(id, width, height){

  var self = this,
    gridRows = [],
    loaded = false
    dom = $('#'+id),
    h = 0, w = 0;

  // Ensure ID is on page
  if (!dom.length) {
    throw new Exception('ID not found on page: '+id);
  }

  // load grid rows with blanks
  for (h = 0; h < height; h++) {
    gridRows[h] = [];
    for (w = 0; w < width; w++) {
      gridRows[h][w] = '';
    }
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

  // What's the y difference given a direction ID
  function getDy(direction) {
    dy = 0;
    switch (direction) {
      case 0: case 1: case 7: dy = 1; break;
      case 3: case 4: case 5: dy = -1; break;
    }
    return dy;
  }

  // What's the x difference given a direction ID
  function getDx(direction) {
    dx = 0;
    switch (direction) {
      case 1: case 2: case 3: dx = 1; break;
      case 5: case 6: case 7: dx = -1; break;
    }
    return dx;
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
    x2 = x + (dx * length);
    y2 = y + (dy * length);

    return { x: x, y: y, x2: x2, y2: y2, d: d, dx: dx, dy: dy, length: length };
  }

  // public
  return {

    /**
     * Given a word, find a place for it to live on the board
     * @param {string} word     Word to place on board
     * @retrun {array} Coordinates of word (x, y, d)
     */
    loadWord: function(word) {
      var line, x, y, c, letter, fits = false, loop = 0;

      word = word.toLowerCase().replace(/\s/,'');

      // loop until this word finds a home
      while (!fits) {
        line = new Line( getRand(height), getRand(width), getRand(7), word.length );
        loop++;

        // just putting brakes on this train
        if (loop > 200) {
          console.log('BREAKING - too many tries');
          return false;
        }

        // check to see if we have a fit
        console.log('Fit check: ', line.y, line.x, line.y2, line.x2, line.d);
        if (line.y2 >= height || line.y2 < 0 || line.x2 >= width || line.x2 < 0) {
          continue;
        }

        fits = true;
        x = line.x;
        y = line.y;
        for (c = 0; c < word.length; c++) {
          // detect any collisions with existing words on page
          letter = word.substring(c, c+1);
          if (gridRows[y][x] != '' && gridRows[y][x] != letter) {
            continue;
          }
          gridRows[y][x] = letter;
          x += line.dx;
          y += line.dy;
        }

      }
      console.log('FITS!!: ', line.x, line.y, line.x2, line.y2, line.d);

      return true;
    },





    /**
     * Render the existing board
     */
    render: function() {
      var self = this, h = 0, w = 0, letter, html = '';

      // Render grid
      for (h = height-1; h >= 0; h--) {
        html += '<div class="gb-row" id="gb'+h+'">'+"\n";
        for (w = 0; w < width; w++) {
          //letter = (gridRows[h][w]) ? gridRows[h][w] : String.fromCharCode(getRand(65, 90));
          letter = (gridRows[h][w]) ? gridRows[h][w] : '&nbsp;';
          html += '<span id="gb' + w + '-' + h + '">' + letter + '</span>';
        }
        html += '</div>'+"\n";
      }
      dom.html(html);
    }

  };


};
