const contrib = require("blessed-contrib");
const PubSub = require("pubsub-js");
const Jalv = require("../jalv");
const store = require("../store");

var monitor = "";

const PluginInfo = function (grid, x, y, xSpan, ySpan) {
  const pluginInfo = grid.set(y, x, ySpan, xSpan, contrib.markdown, {
    label: "Plugin Info",
    input: false,
    mouse: false,
    interactive: false,
    keys: false,
    padding: { left: 1, right: 1 },
    style: {
      border: { fg: "#7ea87f" },
      focus: {
        border: { fg: "red" },
        //   enabled: false,
      },
    },
  });

  var a = contrib.markdown();

  pluginInfo.setMarkdown(` `);

  var token = PubSub.subscribe("selectedPlugin", update);

  function update(msg, plugin) {
    if (!plugin) {
      pluginInfo.setLabel("No Plugin Info");
      pluginInfo.setMarkdown(" ");
    } else {
      pluginInfo.setLabel(plugin.name);
      pluginInfo.setMarkdown(`
  \`by ${plugin.author.name}\`
  ${plugin.comment ? plugin.comment : ""}  
  
  __AUDIO__    : ${plugin.ports.audio.input.length} in / ${
        plugin.ports.audio.output.length
      } out
  __MIDI__     : ${plugin.ports.midi.input.length} in / ${
        plugin.ports.midi.output.length
      } out
  __CONTROL__  : ${plugin.ports.control.input.length} in / ${
        plugin.ports.control.output.length
      } out  
  ${monitor}
  `);
    }
    //   console.log(store.rack[selectedPluginIndex]);
    //   setText(store.rack[selectedPluginIndex]);
  }

  return pluginInfo;
};

module.exports = PluginInfo;
