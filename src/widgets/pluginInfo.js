const blessed = require("blessed");
const contrib = require("blessed-contrib");
const Layout = require("../layout");
const store = require("../store");
const { settings } = require("../../settings");
const { wlogError, wlog } = require("../layout");
var emoji = require("node-emoji");
var pluginInfo = {};

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

  pluginInfo.setMarkdown(`
# Plugin Title
  `);
  return pluginInfo;
}

function setText(plugin) {
  pluginInfo.setMarkdown(``);
}

function update() {
  const plugin = store.getSelectedPlugin();
  if (!plugin) {
    pluginInfo.label = "Plugin Info";
    pluginInfo.setMarkdown(" ");
  } else {
    pluginInfo.setLabel(plugin.name);

    pluginInfo.setMarkdown(`
\`by ${plugin.author.name}\`
${plugin.comment ? plugin.comment : ""}  

__AUDIO__ : ${plugin.ports.audio.input.length} in / ${
      plugin.ports.audio.output.length
    } out
__MIDI__  : ${plugin.ports.midi.input.length} in / ${
      plugin.ports.midi.output.length
    } out
`);
  }
  //   console.log(store.rack[selectedPluginIndex]);
  //   setText(store.rack[selectedPluginIndex]);
}

exports.make = make;
exports.update = update;
