const blessed = require("blessed");
const { jack, modHost } = require("../store");
const contrib = require("blessed-contrib");
const App = require("../app");

var mainMenu = {};

function make(grid, x, y, xSpan, ySpan) {
  mainMenu = grid.set(y, x, ySpan, xSpan, blessed.listbar, {
    items: {
      Main: () => {},
      Minimal: function () {},
      Help: () => {},
      Exit: () => {
        App.exit();
      },
    },
    //  input: true,
    //  mouse: true,
    //  interactive: false,
    //  keys: true,
    autoCommandKeys: true,
    tags: true,
    style: {
      selected: {
        bg: "#689d6a",
        fg: "#FFFFFF",
        bold: true,
      },
      focus: {
        border: { fg: "red" },
        enabled: false,
        selected: {
          bg: "#689d6a",
          fg: "#FFFFFF",

          bold: true,
        },
      },
    },
  });

  return mainMenu;
}

function update() {}

exports.make = make;
exports.update = update;
