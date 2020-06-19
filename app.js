const blessed = require("blessed");
const contrib = require("blessed-contrib");
const Layout = require("./layout");
const Keyboard = require("./keyboard");

// Create a screen object.
const screen = blessed.screen({
  smartCSR: true,
});

const mainGrid = Layout.setUpLayout(screen);
Keyboard.registerKeyboardShortcuts(screen, mainGrid);
screen.render();
