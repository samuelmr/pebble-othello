/*
var Settings = require('settings');
var gameOpts = function() {
  this.menuItems = [{title: 'Local opponent', subtitle: 'Test'}];
};
gameOpts.prototype.menuItems = [{title: 'Local opponent', subtitle: 'Test'}];
console.log(gameOpts.menuItems.length);

var opts = {};
var values = [
  {
    title: 'Randy Random',
    value: 1
  },
  {
    title: 'Greg Greedy',
    value: 2
  },
  {
    title: 'Tom Thoughtful',
    value: 3
  } 
];

var defaultCallback;

// opts.level = new Opt('Local opponent', values[0].title, values, defaultCallback);

var options = {
  menuItems: {title: 'Local opponent', subtitle: values[0].title, items: values} 
};

function defaultCallback() {
  var self = this;
  self.index++;
  if (self.index >= self.values.length) {
    self.index = 0;
  }
  this.subtitle = self.values[self.index].title; // enough, or refresh menu?
  self.currentValue = self.values[self.index].value;
  Settings.option(self.name, self.current);
}

function Opt(name, title, subtitle, values, menuCallback) {
  this.name = name;
  this.title = title;
  this.subtitle = subtitle;
  this.values = values || [];
  this.index = 0;
  this.currentValue = '';
  var self = this;
  // this.menuCallback = menuCallback || defaultCallback;
  this.init = function() {
    self.index = Settings.option(self.name);
    self.currentValue = self.values[self.index].value;
  };  
}

function options() {  
}

options.prototype.menuItems = [
  this.opts.level
];

  // this.menuItems.push(this.opts.level);
this.menuItems.push({title: 'Local opponent', subtitle: values[0].title, items: values});
  new Opt(
      'beginner',
      'First player',
      Settings.option
  ),
      
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
      ];
}
module.exports = gameOpts;
*/
