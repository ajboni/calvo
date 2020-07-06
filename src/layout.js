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
const AudioIO = require("./widgets/audioIO");
const PubSub = require("pubsub-js");

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
  mainMenu,
  carousel;

function setUpLayout(screen) {
  var grid = new contrib.grid({ rows: 18, cols: 12, screen: screen });

  function page1(screen) {
    mainMenu = MainMenuWidget.make(grid, 0, 0, 12, 1, 0);
    categoryWidget = CategoriesWidget.make(grid, 0, 1, 1, 12);
    pluginListWidget = PluginListWidget.make(grid, 1, 1, 3, 12);
    logWidget = LogWidget.make(grid, 0, 13, 4, 5);
    rackWidget = RackWidget.make(grid, 4, 1, 3, 8);
    statusWidget = StatusWidget.make(grid, 4, 13, 2, 5);
    pluginInfoWidget = PluginInfoWidget.make(grid, 4, 9, 3, 4);

    mainScreen = screen;
    mainScreen.focusPush(categoryWidget);
  }

  function page2(screen) {
    mainMenu = MainMenuWidget.make(grid, 0, 0, 12, 1, 1);
    inputWidget = AudioIO.make(grid, 0, 1, 6, 12, "input");
    outputWidget = AudioIO.make(grid, 6, 1, 6, 12, "output");
    logWidget = LogWidget.make(grid, 0, 13, 4, 5);
    statusWidget = StatusWidget.make(grid, 4, 13, 2, 5);
    mainScreen = screen;
    mainScreen.focusPush(inputWidget);
  }

  carousel = new contrib.carousel([page1, page2], {
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
