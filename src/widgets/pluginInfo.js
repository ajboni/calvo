const blessed = require("blessed");
const contrib = require("blessed-contrib");
const Layout = require("../layout");
const { pluginCategories, setCategoryFilter, modHost } = require("../store");
const { settings } = require("../../settings");
const { wlogError, wlog } = require("../layout");

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
Convolution Reverb effect

- Author: Someone
- Contact: mail@asda.com
  
  `);
  return pluginInfo;
}

function update() {}

exports.make = make;
exports.update = update;
