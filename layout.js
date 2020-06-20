const blessed = require("blessed");
const contrib = require("blessed-contrib");
const Jack = require("./jack_client");
const { settings } = require("./settings");
const { modHostProcess } = require("./modhost_client");

const defaultWidgetStyle = {
  focus: {
    border: { fg: "red" },
    enabled: false,
  },
};

let focusIndex = 0;
var mainScreen;
var jackStatusWidget, modHostStatusWidget;

function setUpLayout(screen) {
  var grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });
  //grid.set(row, col, rowSpan, colSpan, obj, opts)
  var categoryWidget = grid.set(0, 0, 6, 2, blessed.box, {
    label: "Categories",
    style: Object.create(defaultWidgetStyle),
  });
  var fxChainWidget = grid.set(6, 0, 4, 2, blessed.box, {
    label: "Fx Chain",
    style: Object.create(defaultWidgetStyle),
  });
  var fxListWidget = grid.set(0, 1, 5, 1, blessed.box, {
    label: "Fx List",
    style: Object.create(defaultWidgetStyle),
  });

  var fxParametersWidget = grid.set(0, 2, 5, 4, blessed.box, {
    label: "Parameters",
    style: Object.create(defaultWidgetStyle),
  });
  var fxVolumeWidget = grid.set(5, 4, 1, 2, blessed.box, {
    label: "Mix",
    style: Object.create(defaultWidgetStyle),
  });

  jackStatusWidget = grid.set(10, 0, 2, 2, blessed.box, {
    label: "JACK Status",
  });
  modHostStatusWidget = grid.set(10, 2, 2, 2, blessed.box, {
    label: "Mod-Host Status",
  });

  logWidget = grid.set(10, 8, 2, 4, contrib.log, {
    label: "Logs",
  });

  modHostStatusWidget.focusabe = false;
  logWidget.focusable = false;
  jackStatusWidget.focusable = false;
  mainScreen = screen;
  focus();
  return grid;
}

function updateLayoutData() {
  //   statusSampleRateWidget.content = Jack.status.SAMPLE_RATE;

  jackStatusWidget.content = `
  JACK Status: ${Jack.status.JACK_STATUS}
  Sample Rate: ${Jack.status.SAMPLE_RATE}
  DSP Load: ${Jack.status.DSP_LOAD} %
  `;

  modHostStatusWidget.content = `
  mod-host PID: ${modHostProcess.PID}
  mod-host Port: ${modHostProcess.PORT}
  mod-host FB Port: ${modHostProcess.FEEDBACK_PORT}
  `;
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
  logWidget.log(msg);
}

exports.setUpLayout = setUpLayout;
exports.focusPrev = focusPrev;
exports.focusNext = focusNext;
exports.updateLayoutData = updateLayoutData;
exports.wlog = wlog;
