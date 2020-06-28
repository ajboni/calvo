const blessed = require("blessed");
const contrib = require("blessed-contrib");
const Layout = require("../layout");
const {
  pluginCategories,
  setCategoryFilter,
  filteredPluginCatalog,
} = require("../store");
const { settings } = require("../../settings");
const { wlogError, wlog } = require("../layout");

function make(grid, x, y, xSpan, ySpan) {
  categoryWidget = grid.set(y, x, ySpan, xSpan, blessed.list, {
    label: "Categories",
    mouse: true,
    scrollbar: {
      // ch: " ",
      // inverse: true,
    },
    items: pluginCategories,
    interactive: true,
    keys: true,
    padding: { left: 1, right: 1 },
    style: {
      selected: {
        bg: "#4d5e4d",
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
    setCategoryFilter(cat.content);
    Layout.focusNext();
  });

  return categoryWidget;
}

exports.make = make;
