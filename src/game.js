var Board = require('board');
/*
var Server = require('server');
*/
var Player = require('player');

var Game = function(window) {
  console.log('new Game');
  this.window = window;
  this.board = new Board(this.window);
  this.mode = null;
  this.player1 = new Player('White');
  this.player2 = new Player('Black');
  this.activePlayer = this.player1;
  this.possible = 0;
  this.winner = null;
  this.server = null;
  console.log(this);
  return this;
};

Game.prototype.start = function(mode, settings) {
  console.log(mode);
  this.mode = mode;
  switch(mode) {
    case 'multi':
      // this.player1 = new Player();
      break;
    case 'local':
      // level from settings
      // black/white from settings (player1.type or player2.type)
      this.player2.type = 'ai';
      break;
    case 'online':
      // this.server = new Server();
      break;
  }
  this.window.add(this.board.place(3, 3).owner(this.player1).disc);
  this.window.add(this.board.place(3, 4).owner(this.player2).disc);
  this.window.add(this.board.place(4, 3).owner(this.player2).disc);
  this.window.add(this.board.place(4, 4).owner(this.player1).disc);
  this.possible = this.board.calculatePossibles(this.activePlayer);
  this.gotoNextHint();
  return this;
};
/*
Game.prototype.updateStatus = function() {
  var p1pegs = this.player1.owns();
  var p2pegs = this.player2.owns();
};
*/
Game.prototype.putPeg = function(window, p1count, p2count, status) {
  var flips = this.board.put(this.activePlayer);
  if (!flips) {
    console.log('Did not flip');
    return this;
  }
  window.add(this.board.place().disc);
  this.activePlayer.gain(flips + 1);
  var opponent = this.activePlayer === this.player1 ? this.player2 : this.player1;
  opponent.lose(flips);
  p1count.text(this.player1.owns());
  p2count.text(this.player2.owns());
  this.advance();

  if (!this.activePlayer) {
    if (this.winner) {
      status.text(this.winner.name + ' wins!');
    }
    else {
      status.text('It\'s a tie!');      
    }
    return this;
  }
  var possibles = this.board.calculatePossibles(this.activePlayer);
  console.log(JSON.stringify(possibles));
  this.possible = (possibles.length > 0);
  if (!this.possible) {
    console.log(this.activePlayer.color + ' must skip');
    this.advance();
    // showCard('No moves!', self.player.color + ' player must skip.', this.advance); // endless loop possible?
  }
  if (this.activePlayer.type === 'ai') {
    var chosen;
    switch (this.activePlayer.level) {
      case 1: // easy
        var n = Math.floor(Math.random()*possibles.length);
        chosen = possibles[n];
        break;
      case 2: // medium
        chosen = possibles[0];
        break;
      case 3: // hard
        var best = possibles.slice();
        best.sort(valueSort);
        console.log(JSON.stringify(best));
        chosen = best[0];
        break;
    }
    if (chosen && this.board.cursor) {
      console.log('Chosen move for level ' + this.activePlayer.level + ': ' + JSON.stringify(chosen));
      this.board.cursor.moveTo(chosen.row, chosen.col);
      this.putPeg(window, p1count, p2count, status);
    }
  }
  else {
    this.gotoNextHint();
    status.text('Go ' + this.activePlayer.name + '!');
  }
  return this;
};

Game.prototype.advance = function() {
  var p1pegs = this.player1.owns();
  var p2pegs = this.player2.owns();
  if ((p1pegs + p2pegs == 64) || !p1pegs || !p2pegs) {
    if (p1pegs == p2pegs) {
      console.log('It\'s a tie!');
      // showCard('Game over!', 'It\'s a tie!');
    }
    else {
      this.winner = p1pegs > p2pegs ? this.player1 : this.player2;
      console.log(this.winner.color + ' wins');
      // status.text(this.winner.name + ' won!');
      // showCard('Game over!', winner.color + ' player wins.');
    }
    this.activePlayer = null;
    return this;
  }
  else {
    console.log('Pegs: ' + this.player1.owns() + ' + ' + this.player2.owns());
  }
  // status.text(self.player.color + '\'s turn');
  this.activePlayer = (this.activePlayer === this.player1) ? this.player2 : this.player1;
  return this;
};
/*
Game.prototype.end = function() {
  
  return this;
};
*/
Game.prototype.save = function() {
  console.log('save');
  return this;
};

Game.prototype.load = function() {
  console.log('load');
  return this;
};

Game.prototype.gotoNextHint = function() {
  var possible = this.board.nextPossible();
  this.board.cursor.moveTo(possible.row, possible.col).draw();  
};

function valueSort(a, b) {
  return a.value - b.value;
}

module.exports = Game;
