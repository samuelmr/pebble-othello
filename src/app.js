var UI = require('ui');
var Vector2 = require('vector2');
var Settings = require('settings');

var rectSize = new Vector2(18, 18);
var countSize = new Vector2(20, 20);

var colorSets = {
  'aplite': {
    boardBg: 'white',
    cursorBg: 'black',
    boardBorder: 'black',
    cursorBorder: 'white',
    bgWhite: 'white',
    bgBlack: 'black',
    colorWhite: 'black',
    colorBlack: 'white',
    borderWhite: 'black',
    borderBlack: 'white'
  },
  'basalt': {
    boardBg: 'green',
    cursorBg: 'islamicGreen',
    boardBorder: 'white',
    cursorBorder: 'black',
    bgWhite: 'white',
    bgBlack: 'black',
    colorWhite: 'black',
    colorBlack: 'white',
    borderWhite: 'darkGray',
    borderBlack: 'lightGray'
  }
};
var colors = colorSets.aplite;
if (Pebble.getActiveWatchInfo) {
  var watch = Pebble.getActiveWatchInfo();
  colors = colorSets[watch.platform];
}
var levelNames = {'-1': 'Easy', '-2': 'Medium', '-3': 'Hard'};

var firstHalf = "18344381897667983725527346500564".split("");
var secondHalf = firstHalf.slice();
var placeValues = firstHalf.concat(secondHalf.reverse());
var pVals;

var alert = new UI.Card({scrolling: true});
var alertTreshold = Settings.option('alertTreshold') || 1;
var autoHint = Settings.option('autoHint') || 0;
var main = new UI.Window({
  fullscreen: true,
});
var status = new UI.Text({
  position: new Vector2(20, 149),
  size: new Vector2(104, 14),
  font: 'gothic-14',
  text: 'White\'s turn',
  textAlign: 'center'
});
main.add(status);
var p1disc = new UI.Circle({
  backgroundColor: colors.bgWhite,
  borderColor: colors.borderWhite,
  position: new Vector2(1 + countSize.x/2, 167 - countSize.y/2),
  radius: countSize.x/2
});
main.add(p1disc);
var p1count = new UI.Text({
  backgroundColor: 'clear',
  color: colors.colorWhite,
  position: new Vector2(1, 165-countSize.y),
  size: countSize,
  font: 'gothic-18-bold',
  text: '2',
  textAlign: 'center'
});
main.add(p1count);
var p2disc = new UI.Circle({
  backgroundColor: colors.bgBlack,
  borderColor: colors.borderBlack,
  position: new Vector2(143 - countSize.x/2, 167 - countSize.y/2),
  radius: countSize.x/2
});
main.add(p2disc);
var p2count = new UI.Text({
  backgroundColor: 'clear',
  color: colors.colorBlack,
  position: new Vector2(143-countSize.x, 165-countSize.y),
  size: countSize,
  font: 'gothic-18-bold',
  text: '2',
  textAlign: 'center'
});
main.add(p2count);
var controls = new UI.Card({
  title: 'Controls',
  body: 'Up: cursor up\n' +
        'Down: cursor down\n' +
        'Select: cursor right\n' +
        'Back: cursor left\n' +
        'Long up: start menu\n' +
        'Long down: show hint\n' +
        'Long select: place peg\n' +
        'Long back: exit game',
  scrollable: true
});
var b;
var board;
var pegs;
var p1;
var p2;
var saved = Settings.option('saved') || null;
var opponentId = Settings.option('opponentId') || -1;
var cStart = Settings.option('cStart') || true;
var cursor = new Cursor();
var turn = new Turn();
var menu = new UI.Menu({
  sections: [
    {
      title: 'Game',
      items: [
        {
          // add local opponents [Randi, Lucy], online play
          title: 'New game for 1',
          subtitle: 'Play against computer',
          callback: initLocal
        },
        {
          title: 'New game for 2',
          subtitle: 'Players share watch',
          callback: init
        },
        {
          title: 'New online game',
          subtitle: 'Create/accept challenge',
          callback: initOnline
        },
        {
          title: 'Save',
          subtitle: 'Save current game',
          callback: storeGame
        },
      ]
    },
    {
      title: 'Options',
      items: [
        {
          title: 'Difficulty level',
          subtitle: 'Computer is ' + levelNames[opponentId.toString()],
          callback: toggleLevel
        },
        {
          title: 'First player',
          subtitle: cStart ? 'Computer starts' : 'You start',
          callback: toggleStarter
        },
        {
          title: 'Automatic hints',
          subtitle: 'Cursor ' + (autoHint ? ' moves' : 'doesn\'t move'),
          callback: toggleHints
        },
        {
          title: 'Toggle alerts',
          subtitle: 'Alert cards are ' + (alertTreshold > 1 ? 'off' : 'on'),
          callback: toggleAlerts
        },
        {
          title: 'Show controls',
          subtitle: 'How buttons work',
          callback: function() { controls.show(); }
        },
        {
          title: 'Quit',
          subtitle: 'Exit the app',
          callback: function() {
            console.log('Exit');
            if (main && main.hide) main.hide();
            if (alert && alert.hide) alert.hide();
            if (menu && menu.hide) menu.hide();
          }
        }
      ]
    },
  
  ] 
});
// main.on('show', function() {
  main.on('click', 'up', cursor.up);
  main.on('click', 'select', cursor.right);
  main.on('click', 'down', cursor.down);
  main.on('click', 'back', cursor.left);
  main.on('longClick', 'up', function() {menu.show();});
  main.on('longClick', 'select', cursor.put);
  main.on('longClick', 'down', turn.nextHint);
// });
if (saved) {
  var items = menu.items(0);
  items.push({
    title: 'Load',
    subtitle: 'Continue saved game',
    callback: restoreGame
  });
  menu.items(0, items); 
}
menu.on('select', function(e) {
  if (e.item.callback && (typeof(e.item.callback) === "function")) {
    e.item.callback(e);
  }
});
menu.show();

function toggleLevel(e) {
  opponentId--;
  if (opponentId < -3) {
    opponentId = -1;
  }
  var title = menu.item(e.sectionIndex, e.itemIndex).title;
  var subtitle = 'Computer is ' + levelNames[opponentId.toString()];
  menu.item(e.sectionIndex, e.itemIndex, {title: title, subtitle: subtitle});
  Settings.option('opponentId', opponentId);
}
function toggleStarter(e) {
  cStart = !cStart;
  var title = menu.item(e.sectionIndex, e.itemIndex).title;
  var subtitle = cStart ? 'Computer starts' : 'You start';
  menu.item(e.sectionIndex, e.itemIndex, {title: title, subtitle: subtitle});
  Settings.option('cStart', cStart);
}
function toggleAlerts(e) {
  alertTreshold = (alertTreshold < 2) ? 2 : 1;
  var title = menu.item(e.sectionIndex, e.itemIndex).title;
  var subtitle = 'Alert cards are ' + (alertTreshold > 1 ? 'off' : 'on');
  menu.item(e.sectionIndex, e.itemIndex, {title: title, subtitle: subtitle});
  Settings.option('alertTreshold', alertTreshold);
}
function toggleHints(e) {
  autoHint = (autoHint) ? 0 : 1;
  var title = menu.item(e.sectionIndex, e.itemIndex).title;
  var subtitle = 'Cursor ' + (autoHint ? ' moves' : 'doesn\'t move');
  menu.item(e.sectionIndex, e.itemIndex, {title: title, subtitle: subtitle});
  Settings.option('autoHint', autoHint);
}
function init() {
  b = new Board(main);
  p1 = new Player('White', p1count, 2);
  p2 = new Player('Black', p2count, 2);
  setUp();
}
function initLocal() {
  b = new Board(main);
  p1 = new Player('White', p1count, 2, cStart ? opponentId : null);
  p2 = new Player('Black', p2count, 2, !cStart ? opponentId : null);
  setUp();
}
function initOnline() {
  showCard('Coming soon', 'Online play not yet available');
  return;
/*
b = new Board(main);
  p1 = new Player('White', p1count, 2);
  p2 = new Player('Black', p2count, 2);
  setUp();
*/
}
function setUp() {
  board = b.slots;
  pegs = b.pegs;
  pegs[3][3] = new Peg(3, 3, p1.color);
  pegs[3][4] = new Peg(3, 4, p2.color);
  pegs[4][3] = new Peg(4, 3, p2.color);
  pegs[4][4] = new Peg(4, 4, p1.color);
  pVals = b.values;
  cursor.moveTo(3, 5);
  turn.set(p1);
  turn.calculateCurrentPossibles();
  main.show();
}
function storeGame(e) {
  // console.log(e);
  var saveItem = menu.item(e.sectionIndex, e.itemIndex);
  var previous = saveItem.subtitle;
  if (!p1 || !p2) {
    menu.item(e.sectionIndex, e.itemIndex, {title: saveItem.title, subtitle: 'No game in progress!'});    
  }
  else {
    Settings.data('p1', {color: p1.color, pegs: p1.pegs, id: p1.id});
    Settings.data('p2', {color: p2.color, pegs: p2.pegs, id: p2.id});
    var storedBoard = [];
    for (var r=0; r<=7; r++) {
      storedBoard[r] = [];
      for (var c=0; c<=7; c++) {
        storedBoard[r][c] = pegs[r][c] ? pegs[r][c].color : null;
      }
    }
    Settings.data('board', storedBoard);
    Settings.data('cursor', {row: cursor.row, col: cursor.col});
    Settings.data('turn', turn.player.color);
    Settings.data('cStart', cStart);
    Settings.data('opponentId', opponentId);
    Settings.data('status', status.text());
    Settings.option('saved', new Date().getTime());
    menu.item(e.sectionIndex, e.itemIndex, {title: saveItem.title, subtitle: 'Game saved'});  
  }
  setTimeout(function() {
    menu.item(e.sectionIndex, e.itemIndex, {title: saveItem.title, subtitle: previous});
  }, 5000);
}
function restoreGame() {
  b = new Board(main);
  board = b.slots;
  pegs = b.pegs;
  var storedP1 = Settings.data('p1');
  p1 = new Player(storedP1.color, p1count, storedP1.pegs, storedP1.id);
  p1.updateCount();
  var storedP2 = Settings.data('p2');
  p2 = new Player(storedP2.color, p2count, storedP2.pegs, storedP1.id);
  p2.updateCount();
  var storedBoard = Settings.data('board');
  for (var r=0; r<=7; r++) {
    for (var c=0; c<=7; c++) {
      if (storedBoard[r][c]) {
        pegs[r][c] = new Peg(r, c, storedBoard[r][c]);
      }
    }
  }
  var storedCursor = Settings.data('cursor');
  cursor.moveTo(storedCursor.row, storedCursor.col);
  var storedTurn = Settings.data('turn');
  turn.set(storedTurn == p2.color ? p2 : p1);
  turn.calculateCurrentPossibles();
  status.text(Settings.data('status'));
  main.show();
}
function showCard(title, subtitle, callback, level) {
  if (!level) {
    level = 1;
  }
  console.log('Card ' + title + ', level ' + level + ', treshold ' + alertTreshold);
  if (level >= alertTreshold) {
    alert.title(title);
    alert.subtitle(subtitle);
    alert.show();
    if (callback && (typeof(callback) === "function")) {
      alert.on('hide', callback);
    }
  }
  else {
    if (callback) {
      console.log('Calling ' + callback);
    }
    if (callback && (typeof(callback) === "function")) {
      callback();
      console.warn(callback + ' is not a function but a ' + typeof(callback));
    }
  }
}
function Board(window) {
  this.window = window;
  this.slots = [];
  this.pegs = [];
  this.values = [];
  var i=0;
  for (var row=0; row<8; row++) {
    this.slots[row] = [];
    this.pegs[row] = [];
    this.values[row] = [];
    for (var col=0; col<8; col++) {
      this.slots[row][col] = new UI.Rect({
        backgroundColor: colors.boardBg,
        borderColor: colors.boardBorder,
        position: new Vector2(col * rectSize.x, row * rectSize.y),
        size: rectSize
      });
      this.window.add(this.slots[row][col]);
      this.values[row][col] = placeValues[i++];
    }
  }
  return this;
}
function Player(color, statusBar, pegs, id) {
  var self = this;
  this.color = color;
  this.statusBar = statusBar;
  this.pegs = pegs;
  this.id = id;
  this.auto = null;
  if (this.id < 0) {
    this.auto = this.id;
  }
  this.updateCount = function() {
    self.statusBar.text(self.pegs);
  };
}
function Turn() {
  var self = this;
  this.player = null;
  this.currentPossibles = [];
  this.currentHint = -1;
  var winner;
  this.set = function(player) {
    self.player = player;
    self.calculateCurrentPossibles();
    return self.player;
  };
  this.forward = function() {
    if (!self.player) {
      console.log('Forward, but no game...');
      return self.player;
    }
    p1.updateCount();
    p2.updateCount();
    if ((p1.pegs + p2.pegs == 64) || !p1.pegs || !p2.pegs) {
      if (p1.pegs == p2.pegs) {
        showCard('Game over!', 'It\'s a tie!');
      }
      else {
        winner = p1.pegs > p2.pegs ? p1 : p2;
        status.text(winner.color + ' won!');
        showCard('Game over!', winner.color + ' player wins.');
      }
      self.player = null;
      return self.player;
    }
    self.player = self.player == p1 ? p2 : p1;
    status.text(self.player.color + '\'s turn');
    self.calculateCurrentPossibles();
    if (!self.isPossible()) {
      showCard('No moves!', self.player.color + ' player must skip.', self.forward); // endless loop possible?      
    }
    return self.player;
  };
  this.nextHint = function() {
    self.currentHint++;
    if (self.currentHint >= self.currentPossibles.length) {
      self.currentHint = 0;
    }
    var possible = self.currentPossibles[self.currentHint];
    if (!possible) {
      return false;
    }
    cursor.moveTo(possible.pos[0], possible.pos[1]);
    return self.currentHint;
  };
  this.isPossible = function() {
    return self.currentPossibles.length;
  };
  this.calculateCurrentPossibles = function() {
    self.currentPossibles = [];
    self.currentHint = -1;
    for (var r=0; r<=7; r++) {
      for (var c=0; c<=7; c++) {
        if (pegs[r][c]) {
          continue;
        }
        var count = cursor.calculate(r, c, false);
        if (count > 0) {
          self.currentPossibles.push({pos: [r, c], count: count});
          // console.log('Found ' + count + ' to eat from [' + r + ', ' + c + ']');
        }
      }
    }
    self.currentPossibles.sort(self.sortByCount);
    // console.log('Possible moves:' + JSON.stringify(self.currentPossibles));
    console.log('Player ' + self.player.color + ' auto: ' + self.player.auto);
    if (self.player.auto) {
      var chosen;
      switch (self.player.auto) {
        case -1: // easy
          var n = Math.floor(Math.random()*self.currentPossibles.length);
          chosen = self.currentPossibles[n];
          break;
        case -2: // medium
          chosen = self.currentPossibles[0];
          break;
        case -3: // hard
          var best = self.currentPossibles.slice();
          best.sort(self.smartSort);
          console.log(JSON.stringify(best));
          chosen = best[0];
          break;
      }
      if (chosen && cursor) {
        console.log('Chosen move for level ' + self.player.auto + ': ' + JSON.stringify(chosen.pos) +
                   ' (' + pVals[chosen.pos[0]][chosen.pos[1]] +')');
        cursor.moveTo(chosen.pos[0], chosen.pos[1]);
        cursor.put();
        return self;
      }
    }
    if (autoHint) {
      self.nextHint();
    }
    return self.currentPossibles;
  };
/*
  this.sortByRandom = function() {
    return 0.5 - Math.random();
  };
*/
  this.sortByCount = function(a, b) {
    return b.count - a.count;
  };
  this.smartSort = function(a, b) {
    return pVals[a.pos[0]][a.pos[1]] - pVals[b.pos[0]][b.pos[1]];    
  };
  return self;
}
function Cursor() {
  var self = this;
  this.row = 0;
  this.col = 0;
  this.draw = function() {
    board[self.row][self.col].borderColor(colors.cursorBorder);
    board[self.row][self.col].backgroundColor(colors.cursorBg);
    return self;
  };
  this.unDraw = function() {
    if (isNaN(self.col) || isNaN(self.row)) {
      return self;
    }
    board[self.row][self.col].borderColor(colors.boardBorder);
    board[self.row][self.col].backgroundColor(colors.boardBg);
    return self;
  };
  this.down = function() {
    self.unDraw();
    self.row++;
    if (self.row > 7) {
      self.row = 0;
    }
    return self.draw();
  };
  this.left = function() {
    self.unDraw();
    self.col--;
    if (self.col < 0) {
      self.col = 7;
    }
    return self.draw();
  };
  this.up = function() {
    self.unDraw();
    self.row--;
    if (self.row < 0) {
      self.row = 7;
    }
    return self.draw();
  };
  this.right = function() {
    self.unDraw();
    self.col++;
    if (self.col > 7) {
      self.col = 0;
    }
    return self.draw();
  };
  this.moveTo = function(row, col) {
    self.unDraw();
    self.row = row;
    self.col = col;
    return self.draw();
  };
  this.put = function() {
    // console.log('Trying to put to ' + self.row + ', ' + self.col);
    if (pegs[self.row][self.col]) {
      // console.log('taken');
      showCard('Illegal move!', 'This seat is already taken.'); 
      return self;
    }
    var flips = self.calculate(self.row, self.col, true);
    if (flips <= 0) {
      // console.log('illegal');
      showCard('Illegal move!', 'Must eat to survive.');
      return self;
    }
    else {
      // console.log('new peg for ' + turn.player.color);
      pegs[self.row][self.col] = new Peg(self.row, self.col, turn.player.color);
      turn.player.pegs += flips + 1;
      var other = turn.player == p1 ? p2 : p1;
      other.pegs -= flips;
      turn.forward();
      return self;
    }
  };
  this.calculate = function(row, col, actual) {
    if (!turn.player) {
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
      if (!pegs[r][c]) break;
      else if (pegs[r][c].color != turn.player.color) seen.push(pegs[r][c]);
      else if (pegs[r][c].color == turn.player.color) {
        flips += seen.length;
        if (actual) {
          for (i=0; i<seen.length; i++) {
            pegs[seen[i].row][seen[i].col].turn();
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
      if (!pegs[r][c]) break;
      else if (pegs[r][c].color != turn.player.color) seen.push(pegs[r][c]);
      else if (pegs[r][c].color == turn.player.color) {
        flips += seen.length;
        if (actual) {
          for (i=0; i<seen.length; i++) {
            pegs[seen[i].row][seen[i].col].turn();
          }
        }
        break;
      }
    }

    // right
    seen = Array(); c = col; r = row;
    while (c < 7) {
      c++;
      if (!pegs[r][c]) break;
      else if (pegs[r][c].color != turn.player.color) seen.push(pegs[r][c]);
      else if (pegs[r][c].color == turn.player.color) {
        flips += seen.length;
        if (actual) {
          for (i=0; i<seen.length; i++) {
            pegs[seen[i].row][seen[i].col].turn();
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
      if (!pegs[r][c]) break;
      else if (pegs[r][c].color != turn.player.color) seen.push(pegs[r][c]);
      else if (pegs[r][c].color == turn.player.color) {
        flips += seen.length;
        if (actual) {
          for (i=0; i<seen.length; i++) {
            pegs[seen[i].row][seen[i].col].turn();
          }
        }
        break;
      }
    }

    // down
    seen = Array(); c = col; r = row;
    while(r < 7) {
      r++;
      if (!pegs[r][c]) break;
      else if (pegs[r][c].color != turn.player.color) seen.push(pegs[r][c]);
      else if (pegs[r][c].color == turn.player.color) {
        flips += seen.length;
        if (actual) {
          for (i=0; i<seen.length; i++) {
            pegs[seen[i].row][seen[i].col].turn();
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
      if (!pegs[r][c]) break;
      else if (pegs[r][c].color != turn.player.color) seen.push(pegs[r][c]);
      else if (pegs[r][c].color == turn.player.color) {
        flips += seen.length;
        if (actual) {
          for (i=0; i<seen.length; i++) {
            pegs[seen[i].row][seen[i].col].turn();
          }
        }
        break;
      }
    }

    // left
    seen = Array(); c = col; r = row;
    while (c > 0) {
      c--;
      if (!pegs[r][c]) break;
      else if (pegs[r][c].color != turn.player.color) seen.push(pegs[r][c]);
      else if (pegs[r][c].color == turn.player.color) {
        flips += seen.length;
        if (actual) {
          for (i=0; i<seen.length; i++) {
            pegs[seen[i].row][seen[i].col].turn();
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
      if (!pegs[r][c]) break;
      else if (pegs[r][c].color != turn.player.color) seen.push(pegs[r][c]);
      else if (pegs[r][c].color == turn.player.color) {
        flips += seen.length;
        if (actual) {
          for (i=0; i<seen.length; i++) {
            pegs[seen[i].row][seen[i].col].turn();
          }
        }
        break;
      }
    }

    return flips;
  };
  return self;
}
function Peg(row, col, color) {
  var self = this;
  this.row = row;
  this.col = col;
  this.color = color;
  this.disc = new UI.Circle({
    backgroundColor: color.toLowerCase(),
    borderColor: colors['border' + color],
    position: new Vector2(col * rectSize.y + rectSize.y/2, row * rectSize.x + rectSize.x/2),
    radius: rectSize.x/2 -1
  });
  main.add(this.disc);
  // console.log('Added peg to ' + JSON.stringify(this.disc.position()) + ', radius: ' + this.disc.radius());
  this.turn = function() {
    self.color = (self.color == p1.color) ? p2.color : p1.color;
    self.disc.backgroundColor(self.color.toLowerCase());
    self.disc.borderColor(colors['border' + self.color]);
  };
  // console.log('Added peg to ' + this.row + ', ' + this.col);
  // console.log(JSON.stringify(pegs));
  return self;
}