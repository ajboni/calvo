const blessed = require("blessed");
const PubSub = require("pubsub-js");
const Jalv = require("../jalv");
const store = require("../store");

const PluginPresets = function (grid, x, y, xSpan, ySpan) {
  const pluginPresets = grid.set(y, x, ySpan, xSpan, blessed.list, {
    label: "Plugin Presets",
    mouse: true,
    scrollbar: {
      ch: " ",
      inverse: true,
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

  var token = PubSub.subscribe("selectedPlugin", update);

  function update(msg, plugin) {
    if (!plugin) {
      pluginPresets.setItems([]);
    } else {
      const presetNames = plugin.presets.map((p) => p.label);
      pluginPresets.setItems(presetNames);
    }
  }

  pluginPresets.on("select", (item, index) => {
    Jalv.setPreset(store.getSelectedPlugin(), index);
  });

  return pluginPresets;
};

module.exports = PluginPresets;
