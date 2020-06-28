const blessed = require("blessed");
const contrib = require("blessed-contrib");
const store = require("../store");
const { settings } = require("../../settings");
const { wlogError } = require("../layout");
let pluginListWidget = {};

function make(grid, x, y, xSpan, ySpan) {
  console.log(store.filteredPluginCatalog);
  pluginListWidget = grid.set(y, x, ySpan, xSpan, blessed.list, {
    label: "Categories",
    mouse: true,
    scrollbar: {
      // ch: " ",
      // inverse: true,
    },
    items: store.filteredPluginCatalog.map((plugin) => plugin.name),
    interactive: true,
    keys: true,
    padding: { left: 1, right: 1 },
    style: {
      // ...defaultWidgetProps.style.focus,
      selected: {
        bg: "#689d6a",
        fg: "#FFFFFF",
        bold: true,
      },
      focus: {
        border: { fg: "red" },
        enabled: false,
      },
    },
  });
  pluginListWidget.key("home", function (ch, key) {
    pluginListWidget.select(0);
  });
  pluginListWidget.key("end", function (ch, key) {
    pluginListWidget.select(pluginListWidget.items.length - 1);
  });
  pluginListWidget.key("pageup", function (ch, key) {
    pluginListWidget.move(-settings.SCROLL_AMMOUNT);
  });
  pluginListWidget.key("pagedown", function (ch, key) {
    pluginListWidget.move(settings.SCROLL_AMMOUNT);
  });
  pluginListWidget.on("select", function (category, index) {});
  return pluginListWidget;
}

function update() {
  const list = store.filteredPluginCatalog.map((plugin) => plugin.name);
  pluginListWidget.setItems(list);
}
exports.make = make;
exports.update = update;
