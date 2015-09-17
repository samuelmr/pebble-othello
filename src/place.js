var UI = require('ui');
var Vector2 = require('vector2');
var sizes = require('sizes');
var colors = require('colors');

// var animDuration = 300;

var Place = function(row, col, value) {
  this.row = row;
  this.col = col;
  this.value = value;
  this._owner = null;
  this.disc = new UI.Circle({
    backgroundColor: 'clear',
    borderColor: 'clear',
    position: new Vector2(col * sizes.rect.y + sizes.rect.y/2, row * sizes.rect.x + sizes.rect.x/2),
    radius: sizes.rect.x/2 -1
  });
  return this;
};

Place.prototype.owner = function(player) {
  if (!player) {
    return this._owner;
  }
  this._owner = player;
  if (!this.disc) {
    console.warn('No disc!');
    return false;
  }
  this.disc.borderColor(colors.disc[player.color].border);
  this.disc.backgroundColor(colors.disc[player.color].bg);
  console.log('set color of ' + this.row + ', ' + this.col + ' to ' + this.disc.backgroundColor() + ' (' + player.color + ')');
/*
    this.disc
    .animate({'radius': 0}, animDuration)
    .queue(function(next) {
      this.borderColor(colors.disc[player.color].border);
      this.backgroundColor(colors.disc[player.color].background);
      next();
    });
  .animate({'radius': sizes.rect.x/2 -1}, animDuration);
*/
  return this;
};

module.exports = Place;
