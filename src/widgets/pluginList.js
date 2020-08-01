const blessed = require("blessed");
const store = require("../store");
const { settings } = require("../../settings");
const PubSub = require("pubsub-js");

const PluginListWidget = function (grid, x, y, xSpan, ySpan) {
  const pluginListWidget = grid.set(y, x, ySpan, xSpan, blessed.list, {
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
      border: { fg: "#7ea87f" },
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
  pluginListWidget.key("home", function (ch, key) {
    pluginListWidget.select(0);
  });
  pluginListWidget.key("end", function (ch, key) {
    pluginListWidget.select(pluginListWidget.items.length - 1);
  });
  pluginListWidget.key("pageup", function (ch, key) {
    pluginListWidget.move(-store.app.SETTINGS.SCROLL_AMMOUNT);
  });
  pluginListWidget.key("pagedown", function (ch, key) {
    pluginListWidget.move(store.app.SETTINGS.SCROLL_AMMOUNT);
  });
  pluginListWidget.on("select", function (e, index) {
    store.addPluginToRack(e.content);
    //  store.setSelectedPlugin(
    //    pluginListWidget.getItem(pluginListWidget.selected).content
    //  );
  });

  var token = PubSub.subscribe("filteredPluginCatalog", update);
  function update(msg, data) {
    const list = data.map((plugin) => plugin.name);
    pluginListWidget.setItems(list);
  }

  return pluginListWidget;
};

module.exports = PluginListWidget;
