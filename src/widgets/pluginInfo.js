const contrib = require("blessed-contrib");
const PubSub = require("pubsub-js");
const Jalv = require("../jalv");
const store = require("../store");

var pluginInfo = {};
var monitor = "";
var monitorPoll = setInterval(jackUpdate, 100);

function make(grid, x, y, xSpan, ySpan) {
  pluginInfo = grid.set(y, x, ySpan, xSpan, contrib.markdown, {
    label: "Plugin Info",
    input: false,
    mouse: false,
    interactive: false,
    keys: false,
    padding: { left: 1, right: 1 },
    style: {
      focus: {
        border: { fg: "red" },
        //   enabled: false,
      },
    },
  });

  var a = contrib.markdown();

  pluginInfo.setMarkdown(` `);

  var token = PubSub.subscribe("selectedPlugin", update);

  return pluginInfo;
}

async function jackUpdate() {
  const plugin = store.getSelectedPlugin();
  if (!plugin || Object.keys(plugin).length === 0) return;

  const pluginMonitors = await Jalv.getControls(plugin, "monitors");
  monitor = JSON.stringify(pluginMonitors);
  pluginInfo.setMarkdown(monitor);
}

function update(msg, plugin) {
  if (!plugin) {
    clearInterval(monitorPoll);
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

exports.make = make;
