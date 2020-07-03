const blessed = require("blessed");
const contrib = require("blessed-contrib");
const { settings } = require("../settings");
const { app } = require("./store");
const CategoriesWidget = require("./widgets/categories");
const PluginListWidget = require("./widgets/pluginList");
const ModHostStatusWidget = require("./widgets/modHostStatus");
const StatusWidget = require("./widgets/status");
const LogWidget = require("./widgets/log");
const PluginInfoWidget = require("./widgets/pluginInfo");
const RackWidget = require("./widgets/rack");
const MainMenuWidget = require("./widgets/mainMenu");
const InputWidget = require("./widgets/input");
const OutputWidget = require("./widgets/output");

let focusIndex = 0;
var mainScreen;
var statusWidget,
  logWidget,
  categoryWidget,
  pluginListWidget,
  pluginInfoWidget,
  rackWidget,
  inputWidget,
  outputWidget,
  mainMenu;

function setUpLayout(screen) {
  var grid = new contrib.grid({ rows: 18, cols: 12, screen: screen });

  mainMenu = MainMenuWidget.make(grid, 0, 0, 12, 1);
  categoryWidget = CategoriesWidget.make(grid, 0, 1, 1, 12);
  pluginListWidget = PluginListWidget.make(grid, 1, 1, 3, 12);

  inputWidget = InputWidget.make(grid, 4, 1, 3, 4);
  rackWidget = RackWidget.make(grid, 4, 5, 3, 5);
  outputWidget = OutputWidget.make(grid, 4, 7, 3, 2);

  pluginInfoWidget = PluginInfoWidget.make(grid, 4, 9, 3, 4);

  logWidget = LogWidget.make(grid, 0, 13, 4, 5);
  statusWidget = StatusWidget.make(grid, 4, 13, 2, 5);

  mainScreen = screen;
  mainScreen.focusPush(categoryWidget);
  return grid;
}

function focusNext() {
  mainScreen.focusNext();
}

function focusPrev() {
  mainScreen.focusPrevious();
}

function focus() {
  mainScreen.focusNext();
}

function wlog(msg) {
  if (logWidget && app.INITIALIZED) {
    logWidget.log(msg);

    //  msg.split("\n").forEach((line) => {
    //    logWidget.log(line);
    //  });
  } else {
    console.log(msg);
  }
}

function wlogError(msg) {
  if (logWidget) {
    logWidget.log(`{red-fg}${msg}{/}`);
  } else {
    console.log(msg);
  }
}

function renderScreen() {
  if (mainScreen) {
    mainScreen.render();
  }
}

exports.setUpLayout = setUpLayout;
exports.focusPrev = focusPrev;
exports.focusNext = focusNext;
exports.wlog = wlog;
exports.wlogError = wlogError;
exports.renderScreen = renderScreen;
