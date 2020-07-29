/**
 * This module handles the main layout instance and widget placement.
 * @module layout
 */

const blessed = require("blessed");
const contrib = require("blessed-contrib");
const { settings } = require("../settings");
const store = require("./store");
const CategoriesWidget = require("./widgets/categories");
const PluginListWidget = require("./widgets/pluginList");
const StatusWidget = require("./widgets/status");
const LogWidget = require("./widgets/log");
const PluginInfoWidget = require("./widgets/pluginInfo");
const PluginMonitor = require("./widgets/pluginMonitor");
const PluginControlWidget = require("./widgets/pluginControls").PluginControls;
const RackWidget = require("./widgets/rack");
const MainMenuWidget = require("./widgets/mainMenu");
const AudioIO = require("./widgets/audioIO");
const PubSub = require("pubsub-js");
const PluginInfo = require("./widgets/pluginInfo");
const PluginPresetsWidget = require("./widgets/pluginPresets");

let focusIndex = 0;
var mainScreen;

/**
 * Sets up the layout in a given screen.
 *
 * @param {*} screen Blessed screen where the layout will be appended to.
 * @returns Returns an array of grids.
 */
function setUpLayout(screen) {
  mainScreen = screen;

  var grid = new contrib.grid({ rows: 28, cols: 18, screen: mainScreen });
  this.mainMenu = MainMenuWidget.make(grid, 0, 0, 18, 2, 0);
  this.logWidget = LogWidget.make(grid, 13, 8, 5, 20);
  this.statusWidget = StatusWidget.make(grid, 13, 2, 5, 6);

  const Page = function (...widgets) {
    this.widgets = widgets;
    this.show = function () {
      this.widgets.forEach((widget) => {
        widget.show();
      });
      mainScreen.focusPush(this.widgets[0]);
    };
    this.hide = () => {
      this.widgets.forEach((widget) => {
        widget.hide();
      });
    };
    this.hide();
  };

  /**
   *
   * Main Page
   * @param {*} screen
   */
  const page0 = new Page(
    new CategoriesWidget(grid, 0, 2, 2, 26),
    new PluginListWidget(grid, 2, 2, 5, 26),
    new RackWidget(grid, 7, 2, 6, 12),
    new PluginInfo(grid, 7, 14, 6, 7)
  );

  /**
   *
   * Perform Page
   */
  const page2 = new Page(
    new RackWidget(grid, 0, 2, 5, 9),
    // new PluginInfoWidget(grid, 0, 14, 6, 7),
    new PluginPresetsWidget(grid, 0, 11, 5, 6),
    new PluginMonitor(grid, 0, 17, 5, 11),
    new PluginControlWidget(grid, 5, 2, 8, 26)
  );

  /**
   * Input/Output page
   *
   * @param {*} screen
   */
  const page4 = new Page(
    new AudioIO(grid, 0, 2, 6, 26, "input"),
    new AudioIO(grid, 7, 2, 6, 26, "output")
  );

  const pageSwitcher = new PageSwitcher(mainScreen, [
    page0,
    page0,
    page2,
    page0,
    page4,
    page0,
    // page4,
  ]);

  PubSub.subscribe("app", function (msg, app) {
    const page = app.CURRENT_PAGE;
    pageSwitcher.setPage(page);
  });

  function PageSwitcher(screen, pages) {
    this.currentPage = pages[0];
    this.currentPage.show();
    this.pages = pages;
    this.init = function () {};
    this.setPage = (pageIndex) => {
      // Hide previous page
      if (pages[pageIndex]) {
        this.currentPage.hide();
        this.currentPage = pages[pageIndex];
        this.currentPage.show();
      } else {
        store.wlogError(`Page ${pageIndex} does not exist.`);
      }
    };
  }

  //   pageSwitcher.init();
  //   return grid;
}

/**
 * Focus next widget
 *
 */
function focusNext() {
  mainScreen.focusNext();
  //   store.wlogDebug(`Focused Control: ${mainScreen.focused.type}`);
}

/**
 * Focus previous widget
 *
 */
function focusPrev() {
  mainScreen.focusPrevious();
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

exports.renderScreen = renderScreen;
