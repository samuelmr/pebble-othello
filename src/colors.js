var colorSets = {
  aplite: {
    board: {bg: 'white', border: 'black'},
    cursor: {bg: 'black', border: 'white'},
    disc: {White: {bg: 'white', border: 'black', color: 'black'},
           Black: {bg: 'black', border: 'white', color: 'white'}}   
    },
  basalt: {
    board: {bg: 'green', border: 'white'},
    cursor: {bg: 'islamicGreen', border: 'black'},
    disc: {White: {bg: 'white', border: 'darkGray', color: 'black'},
           Black: {bg: 'black', border: 'lightGray', color: 'white'}}   
    }
};
var colors = colorSets.aplite;
if (Pebble.getActiveWatchInfo) {
  var watch = Pebble.getActiveWatchInfo();
  colors = colorSets[watch.platform];
}
module.exports = colors;
