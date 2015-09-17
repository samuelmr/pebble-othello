var UI = require('ui');
var Vector2 = require('vector2');
var colors = require('colors');
var sizes = require('sizes');
var Settings = require('settings');

var main = new UI.Window({fullscreen: true});

var Game = require('game');

var g = new Game(main);
g.board.init(main);
g.start('local');

var opponentId = Settings.option('opponentId') || -1;
var cStart = Settings.option('cStart') || true;
var levelNames = {'-1': 'Easy', '-2': 'Medium', '-3': 'Hard'};
// var alert = new UI.Card({scrolling: true});
var alertTreshold = Settings.option('alertTreshold') || 1;
var autoHint = Settings.option('autoHint') || 0;

main.on('click', 'up', moveUp);
main.on('click', 'select', moveRight);
main.on('click', 'down', moveDown);
main.on('click', 'back', moveLeft);
main.on('longClick', 'up', showMenu);
main.on('longClick', 'select', putPeg);
main.on('longClick', 'down', showHint);
main.show();

var status = new UI.Text({
  position: new Vector2(20, 149),
  size: new Vector2(104, 14),
  font: 'gothic-14',
  text: 'Go White!',
  textAlign: 'center'
});
main.add(status);
var p1disc = new UI.Circle({
  backgroundColor: colors.disc.White.bg,
  borderColor: colors.disc.White.border,
  position: new Vector2(1 + sizes.count.x/2, 167 - sizes.count.y/2),
  radius: sizes.count.x/2
});
main.add(p1disc);
var p1count = new UI.Text({
  backgroundColor: 'clear',
  color: colors.disc.White.color,
  position: new Vector2(1, 165-sizes.count.y),
  size: sizes.count,
  font: 'gothic-18-bold',
  text: '2',
  textAlign: 'center'
});
main.add(p1count);
var p2disc = new UI.Circle({
  backgroundColor: colors.disc.Black.bg,
  borderColor: colors.disc.Black.border,
  position: new Vector2(143 - sizes.count.x/2, 167 - sizes.count.y/2),
  radius: sizes.count.x/2
});
main.add(p2disc);
var p2count = new UI.Text({
  backgroundColor: 'clear',
  color: colors.disc.Black.color,
  position: new Vector2(143-sizes.count.x, 165-sizes.count.y),
  size: sizes.count,
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

var menu = new UI.Menu({
  sections: [
    {
      title: 'Game',
      items: [
        {
          // add local opponents [Randi, Lucy], online play
          title: 'New game for 1',
          subtitle: 'Play against computer',
          callback: function() {g.init('local');}
        },
        {
          title: 'New game for 2',
          subtitle: 'Players share watch',
          callback: function() {g.init('multi');}
        },
        {
          title: 'New online game',
          subtitle: 'Create/accept challenge',
          callback: function() {g.init('online');}
        },
        {
          title: 'Save',
          subtitle: 'Save current game',
          callback: function() {g.save();}
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
        }
      ]
    },
    {
      title: 'Other',
      items: [
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
            // if (alert && alert.hide) alert.hide();
            if (menu && menu.hide) menu.hide();
          }
        }        
      ]
    }
  ] 
});
/*
if (saved) {
  var items = menu.items(0);
  items.push({
    title: 'Load',
    subtitle: 'Continue saved game',
    callback: function() {g.load();}
  });
  menu.items(0, items); 
}
*/
menu.on('select', function(e) {
  if (e.item.callback && (typeof(e.item.callback) === "function")) {
    console.log(e.sectionIndex + ', ' + e.itemIndex);
    e.item.callback(e);
  }
});
function moveUp(e) {
  g.board.cursor.up();
}

function moveRight(e) {
  g.board.cursor.right();
}

function moveDown(e) {
  g.board.cursor.down();
}

function moveLeft(e) {
  g.board.cursor.left();
}

function showMenu(e) {
  menu.show();
}

function showHint(e) {
  g.gotoNextHint();
}

function putPeg(e) {
  g.putPeg(main, p1count, p2count, status);
}
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

