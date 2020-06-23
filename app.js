const blessed = require("blessed");
const contrib = require("blessed-contrib");
const Layout = require("./layout");
const Keyboard = require("./keyboard");
const Jack = require("./jack_client");
const ModHost = require("./modhost_client");
const { settings } = require("./settings");
const LV2 = require("./lv2");
const { lv2ls, pluginInfo, grep, listAllPlugins } = require("./lv2");
const { pluginsUriByName } = require("./store");

const program = blessed.program();

// Create a screen object.
const screen = blessed.screen({
  smartCSR: true,
});

try {
  const mainGrid = Layout.setUpLayout(screen);
  Keyboard.registerKeyboardShortcuts(screen, mainGrid);
  LV2.init();
  console.log(pluginsUriByName.keys());

  Jack.init();
  ModHost.init();
} catch (error) {
  console.log("ERROR: " + error);
  console.log("Aborting...");
  process.exit(0);
}

Layout.updateLayoutData();
screen.render();

let jackPoll = setInterval(() => {
  Jack.poll();
}, settings.JACK_POLLING_RATE);

let uiPoll = setInterval(() => {
  Layout.updateLayoutData();
  screen.render();
}, settings.UI_UPDATE_RATE);

function exit() {
  program.clear();
  screen.detach();
  ModHost.destroy();
  return process.exit(0);
}

exports.exit = exit;
