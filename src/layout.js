const blessed = require("blessed");
const contrib = require("blessed-contrib");
const { settings } = require("../settings");
const {
  jack,
  modHost,
  modHostStatusEnum,
  app,
  filteredPluginCatalog,
  pluginCatalog,
} = require("./store");
const CategoriesWidget = require("./widgets/categories");
const PluginListWidget = require("./widgets/pluginList");
const ModHostStatusWidget = require("./widgets/modHostStatus");
const StatusWidget = require("./widgets/status");
const LogWidget = require("./widgets/log");
const PluginInfoWidget = require("./widgets/pluginInfo");

let focusIndex = 0;
var mainScreen;
var statusWidget, logWidget, categoryWidget, pluginListWidget, pluginInfoWidget;

// a.sette
function setUpLayout(screen) {
  var grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });
  categoryWidget = CategoriesWidget.make(grid, 0, 0, 1, 8);
  pluginListWidget = PluginListWidget.make(grid, 1, 0, 3, 8);

  logWidget = LogWidget.make(grid, 0, 8, 4, 4);
  statusWidget = StatusWidget.make(grid, 4, 8, 2, 4);
  pluginInfoWidget = PluginInfoWidget.make(grid, 4, 0, 3, 4);

  mainScreen = screen;
  mainScreen.focusPush(categoryWidget);
  mainScreen.focusPush(pluginListWidget);
  focus();
  return grid;
}

function updateLayoutData() {
  StatusWidget.update();
}

function focusNext() {
  mainScreen.focusNext();
}

function focusPrev() {
  mainScreen.focusPrevious();
}

function focus() {
  mainScreen.focusNext();
  //   mainScreen.render();
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
exports.updateLayoutData = updateLayoutData;
exports.wlog = wlog;
exports.wlogError = wlogError;
exports.renderScreen = renderScreen;
