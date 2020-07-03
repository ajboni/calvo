const blessed = require("blessed");
const store = require("../store");
const { settings } = require("../../settings");
const PubSub = require("pubsub-js");
let pluginListWidget = {};

function make(grid, x, y, xSpan, ySpan) {
  pluginListWidget = grid.set(y, x, ySpan, xSpan, blessed.list, {
    label: "Available Plugins",
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
  pluginListWidget.on("select", function (e, index) {
    store.addPluginToRack(e.content);
    //  store.setSelectedPlugin(
    //    pluginListWidget.getItem(pluginListWidget.selected).content
    //  );
  });

  var token = PubSub.subscribe("filteredPluginCatalog", update);

  return pluginListWidget;
}

function update(msg, data) {
  const list = data.map((plugin) => plugin.name);
  pluginListWidget.setItems(list);
}
exports.make = make;