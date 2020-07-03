const blessed = require("blessed");
const contrib = require("blessed-contrib");
const Layout = require("./layout");
const Keyboard = require("./keyboard");
const Jack = require("./jack_client");
const ModHost = require("./modhost_client");
const { settings } = require("../settings");
const LV2 = require("./lv2");
const { lv2ls, pluginInfo, grep, listAllPlugins } = require("./lv2");
const store = require("./store");
const program = blessed.program();
const screen = blessed.screen({
  smartCSR: true,
});

try {
  LV2.init();
  Jack.init();
  ModHost.init();

  // Create a screen object.
  const mainGrid = Layout.setUpLayout(screen);
  Keyboard.registerKeyboardShortcuts(screen, mainGrid);
} catch (error) {
  console.trace("ERROR: " + error);
  console.log("Aborting...");
  process.exit(0);
}

screen.render();
program.enableMouse();

store.app.INITIALIZED = true;
Jack.poll();
// Set up polling
let jackPoll = setInterval(() => {
  Jack.poll();
}, settings.JACK_POLLING_RATE);

let uiPoll = setInterval(() => {
  store.notifySubscribers();
  screen.render();
}, settings.UI_UPDATE_RATE);

function exit() {
  program.clear();
  screen.detach();
  ModHost.destroy();
  return process.exit(0);
}

exports.exit = exit;
