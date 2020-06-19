const blessed = require("blessed");
const contrib = require("blessed-contrib");
const defaultWidgetStyle = {
  focus: {
    border: { fg: "red" },
  },
};

let focusIndex = 0;
var mainScreen;

function setUpLayout(screen) {
  var grid = new contrib.grid({ rows: 6, cols: 6, screen: screen });
  //grid.set(row, col, rowSpan, colSpan, obj, opts)
  var categoryWidget = grid.set(0, 0, 3, 1, blessed.box, {
    label: "Categories",
    style: Object.create(defaultWidgetStyle),
  });
  var fxChainWidget = grid.set(3, 0, 2, 1, blessed.box, {
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

  mainScreen = screen;
  focus();

  return grid;
}

function focusNext() {
  if (focusIndex >= mainScreen.children.length - 1) {
    focusIndex = 0;
  } else {
    focusIndex++;
  }
  focus();
}

function focusPrev() {
  if (focusIndex <= 0) {
    focusIndex = mainScreen.children.length - 1;
  } else {
    focusIndex--;
  }
  focus();
}

function focus() {
  mainScreen.children[focusIndex].focus();
  mainScreen.render();
}

exports.setUpLayout = setUpLayout;
exports.focusPrev = focusPrev;
exports.focusNext = focusNext;
