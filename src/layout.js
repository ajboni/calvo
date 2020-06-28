const blessed = require("blessed");
const contrib = require("blessed-contrib");
const Jack = require("./jack_client");
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

const defaultWidgetProps = {
  alwaysScroll: true,
  interactive: true,
  scrollbar: {
    ch: " ",
    inverse: true,
  },
  mouse: true,
  style: {
    focus: {
      border: { fg: "red" },
      enabled: false,
    },
  },
};

let focusIndex = 0;
var mainScreen;
var jackStatusWidget,
  modHostStatusWidget,
  logWidget,
  categoryWidget,
  pluginListWidget;

// a.sette
function setUpLayout(screen) {
  var grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });
  categoryWidget = CategoriesWidget.make(grid, 0, 0, 1, 6);
  pluginListWidget = PluginListWidget.make(grid, 1, 0, 4, 6);
  //   var fxChainWidget = grid.set(3, 2, 3, 2, blessed.box, {
  //     label: "Fx Chain",
  //     ...JSON.parse(JSON.stringify(defaultWidgetProps)),

  //   var fxParametersWidget = grid.set(0, 4, 5, 4, blessed.box, {
  //     label: "Parameters",
  //     ...JSON.parse(JSON.stringify(defaultWidgetProps)),
  //   });
  //   var fxVolumeWidget = grid.set(5, 4, 1, 2, blessed.box, {
  //     label: "Mix",
  //     ...JSON.parse(JSON.stringify(defaultWidgetProps)),
  //   });

  jackStatusWidget = grid.set(10, 0, 2, 2, blessed.box, {
    label: "JACK Status",
    ...JSON.parse(JSON.stringify(defaultWidgetProps)),
  });
  modHostStatusWidget = grid.set(10, 2, 2, 2, blessed.box, {
    label: "Mod-Host Status",
    ...JSON.parse(JSON.stringify(defaultWidgetProps)),
  });

  // LOG
  logWidget = grid.set(6, 0, 4, 4, blessed.log, {
    label: "Logs",
    tags: true,
    ...JSON.parse(JSON.stringify(defaultWidgetProps)),
  });

  logWidget.enableInput();
  logWidget.on("click", function (data) {
    screen.copyToClipboard("ssss");
    wlog("Log copied to clipboard.");
  });
  //   logWidget.focusable = false;

  modHostStatusWidget.focusabe = false;
  jackStatusWidget.focusable = false;
  mainScreen = screen;
  focus();
  return grid;
}

function updateLayoutData() {
  jackStatusWidget.content = `
  JACK Status: ${jack.JACK_STATUS.status} ${
    jack.JACK_STATUS.realtime ? "(RT)" : ""
  }
  Sample Rate: ${jack.JACK_STATUS.sample_rate} 
  Buffer: ${jack.JACK_STATUS.block_size}
  DSP Load: ${jack.JACK_STATUS.cpu_load.toFixed(2)} %
  Transport: ${jack.TRANSPORT_STATUS.state}
  Time: ${jack.TRANSPORT_STATUS.beats_per_bar}/${
    jack.TRANSPORT_STATUS.beat_type
  } @ ${jack.TRANSPORT_STATUS.beats_per_minute} bpm
  `;

  modHostStatusWidget.content = `
  Status: ${modHost.STATUS}
  PID: ${modHost.PID}
  Port: ${modHost.PORT}
  `;

  //   mainScreen.render();
}

function focusNext() {
  if (focusIndex >= mainScreen.children.length - 1) {
    focusIndex = 0;
  } else {
    focusIndex++;
  }

  mainScreen.children[focusIndex].focusable === false ? focusNext() : focus();
}

function focusPrev() {
  if (focusIndex <= 0) {
    focusIndex = mainScreen.children.length - 1;
  } else {
    focusIndex--;
  }
  focus();
  mainScreen.children[focusIndex].focusable === false ? focusPrev() : focus();
}

function focus() {
  mainScreen.children[focusIndex].focus();
  mainScreen.render();
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
