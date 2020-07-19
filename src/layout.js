/**
 * This module handles the main layout instance and widget placement.
 * @module layout
 */

const blessed = require("blessed");
const contrib = require("blessed-contrib");
const { settings } = require("../settings");
const { app } = require("./store");
const CategoriesWidget = require("./widgets/categories");
const PluginListWidget = require("./widgets/pluginList");
const StatusWidget = require("./widgets/status");
const LogWidget = require("./widgets/log");
const PluginInfoWidget = require("./widgets/pluginInfo");
const PluginControlWidget = require("./widgets/pluginControls");
const RackWidget = require("./widgets/rack");
const MainMenuWidget = require("./widgets/mainMenu");
const AudioIO = require("./widgets/audioIO");
const PubSub = require("pubsub-js");

let focusIndex = 0;
var mainScreen;
var statusWidget,
  logWidget,
  categoryWidget,
  pluginListWidget,
  pluginInfoWidget,
  pluginControlWidget,
  rackWidget,
  inputWidget,
  outputWidget,
  mainMenu,
  carousel;

/**
 * Sets up the layout in a given screen.
 *
 * @param {*} screen Blessed screen where the layout will be appended to.
 * @returns Returns a blessed grid.
 */
function setUpLayout(screen) {
  var grid = new contrib.grid({ rows: 28, cols: 18, screen: screen });

  /**
   *
   * Main Page
   * @param {*} screen
   */
  function page0(screen) {
    mainMenu = MainMenuWidget.make(grid, 0, 0, 18, 2, 0);
    categoryWidget = CategoriesWidget.make(grid, 0, 2, 2, 26);
    pluginListWidget = PluginListWidget.make(grid, 2, 2, 5, 26);
    rackWidget = RackWidget.make(grid, 7, 2, 6, 12);
    pluginInfoWidget = PluginInfoWidget.make(grid, 7, 14, 6, 7);
    statusWidget = StatusWidget.make(grid, 7, 21, 6, 7);
    logWidget = LogWidget.make(grid, 13, 2, 5, 26);

    mainScreen = screen;
    mainScreen.focusPush(categoryWidget);
  }

  /**
   *
   * Perform Page
   * @param {*} screen
   */
  function page2(screen) {
    mainMenu = MainMenuWidget.make(grid, 0, 0, 18, 2, 2);
    rackWidget = RackWidget.make(grid, 0, 2, 6, 12);
    pluginInfoWidget = PluginInfoWidget.make(grid, 0, 14, 6, 7);
    statusWidget = StatusWidget.make(grid, 0, 21, 6, 7);
    pluginControlWidget = PluginControlWidget.make(grid, 6, 2, 7, 12);
    logWidget = LogWidget.make(grid, 13, 2, 5, 26);

    mainScreen = screen;
    mainScreen.focusPush(rackWidget);
  }

  /**
   * Input/Output page
   *
   * @param {*} screen
   */
  function page4(screen) {
    mainMenu = MainMenuWidget.make(grid, 0, 0, 18, 2, 4);
    inputWidget = AudioIO.make(grid, 0, 2, 7, 11, "input");
    outputWidget = AudioIO.make(grid, 7, 2, 7, 11, "output");
    logWidget = LogWidget.make(grid, 14, 2, 4, 16);
    statusWidget = StatusWidget.make(grid, 7, 13, 7, 5);
    mainScreen = screen;
    mainScreen.focusPush(inputWidget);
  }

  carousel = new contrib.carousel([page0, page0, page2, page0, page4, page0], {
    screen: screen,
    interval: 0, //how often to switch views (set 0 to never swicth automatically)
    controlKeys: false, //should right and left keyboard arrows control view rotation
  });

  PubSub.subscribe("app", function (msg, app) {
    const page = app.CURRENT_PAGE;
    if (page != carousel.currPage) {
      carousel.currPage = page;
      carousel.move();
    }
  });

  carousel.start();
  return grid;
}

/**
 * Focus next widget
 *
 */
function focusNext() {
  mainScreen.focusNext();
}

/**
 * Focus previous widget
 *
 */
function focusPrev() {
  mainScreen.focusPrevious();
}

/**
 * Logs a message in the log-widget
 * @todo Move to the widget module.
 * @param {*} msg message to log.
 */
function wlog(msg) {
  if (logWidget && app.INITIALIZED) {
    logWidget.log(msg);
  } else {
    console.log(msg);
  }
}

/**
 * Logs an error message in the log Widget
 * * @param {*} msg
 */
function wlogError(msg) {
  if (logWidget) {
    logWidget.log(`{red-fg}${msg}{/}`);
  } else {
    console.log(msg);
  }
}

/**
 * triggers a screen re-render
 *
 */
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
