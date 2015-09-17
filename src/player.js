function Player(color, name, level) {
  this.color = color;
  this.name = name || this.color;
  this.pegs = 2;
  this.level = 1;
  this.type = 'local';
}

Player.prototype.owns = function() {
  return this.pegs;
};

Player.prototype.gain = function(number) {
  this.pegs += number;
  return this.pegs;
};

Player.prototype.lose = function(number) {
  this.pegs -= number;
  return this.pegs;
};

module.exports = Player;