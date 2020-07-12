const blessed = require("blessed");
const contrib = require("blessed-contrib");
const PubSub = require("pubsub-js");

var outputWidget = {};

function make(grid, x, y, xSpan, ySpan) {
  outputWidget = grid.set(y, x, ySpan, xSpan, blessed.box, {
    label: "Output",
    mouse: true,
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

  //   var token = PubSub.subscribe("selectedPlugin", update);

  return outputWidget;
}

function update(msg, plugin) {}

exports.make = make;
