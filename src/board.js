var Cursor = require('cursor');
// var Player = require('player');
var Place = require('place');

var firstHalf = "18344381897667983725527346500564".split("");
var secondHalf = firstHalf.slice();
var places = [];
var placeValues = firstHalf.concat(secondHalf.reverse());
var possibles = [];
var currentHint;

var Board = function() {
  console.log('new board');
  this.cursor = new Cursor();
  return this;
};
Board.prototype.init = function(window) {
  var count = 0;
  for (var row=0; row<=7; row++) {
    places[row] = [];
    for (var col=0; col<=7; col++) {
      places[row][col] = new Place(row, col, placeValues[count++]);
      window.add(this.cursor.moveTo(row, col).init().rect);
    }
  }
};
/*
Board.prototype.ownedBy = function(player, forceUpdate) {
  if (forceUpdate) {
    var owned = 0;
    for (var row=0; row<=7; row++) {
      for (var col=0; col<=7; col++) {
        if (places[row][col] === player) {
          owned++;
        }
      }
    }
    player.owns(owned);
  }
  return player.owns();
};
*/
Board.prototype.put = function(player) {
  var row = this.cursor.row;
  var col = this.cursor.col;
  console.log('Trying to put to ' + row + ', ' + col);
  if (places[row][col].owner()) {
    console.log('taken by ' + places[row][col].owner());
    // showCard('Illegal move!', 'This seat is already taken.'); 
    return 0;
  }
  var flips = this.calculate(row, col, player, true);
  if (flips <= 0) {
    console.log('Did not eat');
    // showCard('Illegal move!', 'Must eat.'); 
    return flips;
  }
  else {
    places[row][col].owner(player);
  }
  return flips;
};
Board.prototype.place = function(row, col) {
  if (row && col) {
    this.cursor.row = row;
    this.cursor.col = col;
  }
  if (!places[this.cursor.row]) {
    console.warn('No places!');
    return false;
  }
  else if (!places[this.cursor.row][this.cursor.col]) {
    console.warn('No place at ' + this.cursor.row + ', ' + this.cursor.col);
    return false;
  }
  return places[this.cursor.row][this.cursor.col];
};
Board.prototype.calculate = function(row, col, player, put) {
    if (!player) {
      console.warn('No player for ' + row + ', ' + col);
      return false;
    }
    var seen;
    var flips = 0;
    var c;
    var r;
    var i;
    // up
    seen = Array(); c = col; r = row;
    while (r > 0) {
      r--;
      if (!places[r][c].owner()) break;
      else if (places[r][c].owner() !== player) seen.push(places[r][c]);
      else if (places[r][c].owner() === player) {
        flips += seen.length;
        if (put) {
          for (i=0; i<seen.length; i++) {
            places[seen[i].row][seen[i].col].owner(player);
          }    
        }
        break;
      }
    }
    // upright
    seen = Array(); c = col; r = row;
    while (c < 7 && r > 0) {
      c++;
      r--;
      if (!places[r][c].owner()) break;
      else if (places[r][c].owner() !== player) seen.push(places[r][c]);
      else if (places[r][c].owner() === player) {
        flips += seen.length;
        if (put) {
          for (i=0; i<seen.length; i++) {
            places[seen[i].row][seen[i].col].owner(player);
          }
        }
        break;
      }
    }
    // right
    seen = Array(); c = col; r = row;
    while (c < 7) {
      c++;
      if (!places[r][c].owner()) break;
      else if (places[r][c].owner() !== player) seen.push(places[r][c]);
      else if (places[r][c].owner() === player) {
        flips += seen.length;
        if (put) {
          for (i=0; i<seen.length; i++) {
            places[seen[i].row][seen[i].col].owner(player);
          }
        }
        break;
      }
    }
    // downright
    seen = Array(); c = col; r = row;
    while (c < 7 && r < 7) {
      c++;
      r++;
      if (!places[r][c].owner()) break;
      else if (places[r][c].owner() !== player) seen.push(places[r][c]);
      else if (places[r][c].owner() === player) {
        flips += seen.length;
        if (put) {
          for (i=0; i<seen.length; i++) {
            places[seen[i].row][seen[i].col].owner(player);
          }
        }
        break;
      }
    }
    // down
    seen = Array(); c = col; r = row;
    while(r < 7) {
      r++;
      if (!places[r][c].owner()) break;
      else if (places[r][c].owner() !== player) seen.push(places[r][c]);
      else if (places[r][c].owner() === player) {
        flips += seen.length;
        if (put) {
          for (i=0; i<seen.length; i++) {
            places[seen[i].row][seen[i].col].owner(player);
          }
        }
        break;
      }
    }
    // downleft
    seen = Array(); c = col; r = row;
    while(c > 0 && r < 7) {
      c--;
      r++;
      if (!places[r][c].owner()) break;
      else if (places[r][c].owner() !== player) seen.push(places[r][c]);
      else if (places[r][c].owner() === player) {
        flips += seen.length;
        if (put) {
          for (i=0; i<seen.length; i++) {
            places[seen[i].row][seen[i].col].owner(player);
          }
        }
        break;
      }
    }
    // left
    seen = Array(); c = col; r = row;
    while (c > 0) {
      c--;
      if (!places[r][c].owner()) break;
      else if (places[r][c].owner() !== player) seen.push(places[r][c]);
      else if (places[r][c].owner() === player) {
        flips += seen.length;
        if (put) {
          for (i=0; i<seen.length; i++) {
            console.log(seen[i].row + ', ' + seen[i].col);
            places[seen[i].row][seen[i].col].owner(player);
          }
        }
        break;
      }
    }
    // upleft
    seen = Array(); c = col; r = row;
    while (c > 0 && r > 0) {
      c--;
      r--;
      if (!places[r][c].owner()) break;
      else if (places[r][c].owner() !== player) seen.push(places[r][c]);
      else if (places[r][c].owner() === player) {
        flips += seen.length;
        if (put) {
          for (i=0; i<seen.length; i++) {
            places[seen[i].row][seen[i].col].owner(player);
          }
        }
        break;
      }
    }
    // console.log('Found ' + flips);
    return flips;
};
Board.prototype.calculatePossibles = function(player) {
  possibles = [];
  currentHint = -1;
  for (var r=0; r<=7; r++) {
    for (var c=0; c<=7; c++) {
      if (places[r][c].owner()) {
        continue;
      }
      var count = this.calculate(r, c, player, false);
      if (count > 0) {
        possibles.push({row: r, col: c, count: count, value: places[r][c].value});
      }
    }
  }
  possibles.sort(sortByCount);
  console.log(JSON.stringify(possibles));
  return possibles;
};
Board.prototype.nextPossible = function() {
  currentHint++;
  if (currentHint >= possibles.length) {
    currentHint = 0;
  }
  var possible = possibles[currentHint];
  if (!possible) {
    return false;
  }
  console.log('Suggesting ' + possible.row + ', ' + possible.col + ' (value ' + possible.value + ')');
  return possible;
};
function sortByCount(a, b) {
  return b.count - a.count; // descending
}

module.exports = Board;
