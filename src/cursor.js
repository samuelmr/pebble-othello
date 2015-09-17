var Vector2 = require('vector2');
var UI = require('ui');
var colors = require('colors');
var sizes = require('sizes');

var rects = [];
for (var i=0; i<=8; i++) {
  rects[i] = [];
}
var Cursor = function() {
  this.row = 0;
  this.col = 0;
  this.rect = rects[this.row][this.col];
  return this;
};
Cursor.prototype.init = function() {
  rects[this.row][this.col] = new UI.Rect({
    backgroundColor: colors.board.bg,
    borderColor: colors.board.border,
    position: new Vector2(this.col * sizes.rect.x, this.row * sizes.rect.y),
     size: sizes.rect
  });
  this.rect = rects[this.row][this.col];
  return this;
};
Cursor.prototype.draw = function() {
  if (this.rect) {
    this.rect.borderColor(colors.cursor.border);
    this.rect.backgroundColor(colors.cursor.bg);
  }
  return this;
};
Cursor.prototype.unDraw = function() {
  if (this.rect) {
    this.rect.borderColor(colors.board.border);
    this.rect.backgroundColor(colors.board.bg);
  }
  return this;
};
Cursor.prototype.right = function() {
  this.unDraw();
  this.col++;
  if (this.col > 7) {
    this.col = 0;
  }
  this.rect = rects[this.row][this.col];
  return this.draw();
};
Cursor.prototype.down = function() {
  this.unDraw();
  this.row++;
  if (this.row > 7) {
    this.row = 0;
  }
  this.rect = rects[this.row][this.col];
  return this.draw();
};
Cursor.prototype.left = function() {
  this.unDraw();
  this.col--;
  if (this.col < 0) {
    this.col = 7;
  }
  this.rect = rects[this.row][this.col];
  return this.draw();
};
Cursor.prototype.up = function() {
  this.unDraw();
  this.row--;
  if (this.row < 0) {
    this.row = 7;
  }
  this.rect = rects[this.row][this.col];
  return this.draw();
};
Cursor.prototype.moveTo = function(row, col) {
  this.unDraw();
  this.row = row;
  this.col = col;
  this.rect = rects[this.row][this.col];
  console.log('Moved to ' + this.row + ', '+ this.col);
  return this;
};

module.exports = Cursor;
