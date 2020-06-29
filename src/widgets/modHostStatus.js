const blessed = require("blessed");
const contrib = require("blessed-contrib");
const Layout = require("../layout");
const { modHost } = require("../store");

var modHostStatus = {};

function make(grid, x, y, xSpan, ySpan) {
  modHostStatus = grid.set(y, x, ySpan, xSpan, contrib.markdown, {
    label: "Mod Host Status",
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

  return modHostStatus;
}

function update() {
  modHostStatus.setMarkdown(`
__Status:__ ${modHost.STATUS}
__PID:__ ${modHost.PID}
__Port:__ ${modHost.PORT}
`);
}

exports.make = make;
exports.update = update;
