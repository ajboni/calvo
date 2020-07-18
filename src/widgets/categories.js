const blessed = require("blessed");
const contrib = require("blessed-contrib");
const Layout = require("../layout");
const store = require("../store");
const { settings } = require("../../settings");

var categoryWidget = {};
function make(grid, x, y, xSpan, ySpan) {
  categoryWidget = grid.set(y, x, ySpan, xSpan, blessed.list, {
    label: "Categories",
    mouse: true,
    scrollbar: {
      // ch: " ",
      // inverse: true,
    },

    interactive: true,
    keys: true,
    padding: { left: 1, right: 1 },
    style: {
      selected: {
        bg: "#4d5e4d",
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

  //  It might be a bug in blessed.contrib, but, if I set the items on the constructor, the items duplicate when changing screens.
  categoryWidget.setItems(store.pluginCategories);

  categoryWidget.key("home", function (ch, key) {
    categoryWidget.select(0);
  });

  categoryWidget.key("end", function (ch, key) {
    categoryWidget.select(categoryWidget.items.length - 1);
  });
  categoryWidget.key("pageup", function (ch, key) {
    categoryWidget.move(-settings.SCROLL_AMMOUNT);
  });

  categoryWidget.key("pagedown", function (ch, key) {
    categoryWidget.move(settings.SCROLL_AMMOUNT);
  });

  categoryWidget.on("select", function (cat, index) {
    store.setCategoryFilter(cat.content);
    Layout.focusNext();
  });

  return categoryWidget;
}

exports.make = make;
