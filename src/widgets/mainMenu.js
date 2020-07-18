const blessed = require("blessed");
const contrib = require("blessed-contrib");
const App = require("../app");
const store = require("../store");

var mainMenu = {};

function make(grid, x, y, xSpan, ySpan, page = -1) {
  mainMenu = grid.set(y, x, ySpan, xSpan, blessed.listbar, {
    items: {
      Choose: () => {
        store.setCurrentPage(0);
      },
      Mix: () => {
        store.setCurrentPage(1);
      },
      Perform: () => {
        store.setCurrentPage(2);
      },
      Visualize: () => {
        store.setCurrentPage(3);
      },
      Connect: () => {
        store.setCurrentPage(4);
      },
      Debug: () => {
        store.setCurrentPage(5);
      },
      "Reconnect All": () => {
        store.reconectAll();
      },
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
        fg: "#f0f0f0",
        bold: true,
      },
      focus: {
        border: { fg: "red" },
        enabled: false,
        selected: {
          bg: "#689d6a",
          fg: "#f0f0f0",

          bold: true,
        },
      },
    },
  });

  if (page > 0) {
    mainMenu.select(page);
  }

  return mainMenu;
}

function update() {}

exports.make = make;
exports.update = update;
