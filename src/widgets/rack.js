const blessed = require("blessed");
const contrib = require("blessed-contrib");
const Layout = require("../layout");
const store = require("../store");
const PubSub = require("pubsub-js");

var rack = {};
function make(grid, x, y, xSpan, ySpan) {
  rack = grid.set(y, x, ySpan, xSpan, blessed.list, {
    label: "RACK",
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

  //   Keyboard Events
  rack.key("home", function (ch, key) {
    rack.select(0);
  });
  rack.key("end", function (ch, key) {
    rack.select(rack.items.length - 1);
  });
  rack.key("pageup", function (ch, key) {
    rack.move(-settings.SCROLL_AMMOUNT);
  });
  rack.key("pagedown", function (ch, key) {
    rack.move(settings.SCROLL_AMMOUNT);
  });
  rack.on("select", function (e, index) {
    if (rack.items.length > 0) store.setSelectedPluginIndex(e.content, index);
  });

  rack.key(["backspace", "delete"], function () {
    if (rack.items.length > 0) store.removePluginAt(rack.selected);
  });

  // Subscribe to 'rack' updates
  var token = PubSub.subscribe("rack", update);
  return rack;
}

function update(msg, data) {
  const names = data.map((p) => p.name);
  rack.setItems(names);
}

exports.make = make;
