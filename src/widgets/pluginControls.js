const blessed = require("blessed");
const contrib = require("blessed-contrib");
const PubSub = require("pubsub-js");
const Layout = require("../layout");
const store = require("../store");

var pluginControls = {};

function progressControl(value, top, pluginControl) {
  const {
    comment,
    designation,
    index,
    name,
    properties,
    rangeSteps,
    ranges,
    scalePoints,
    shortName,
    symbolm,
    units,
  } = pluginControl;

  // {
  // 	"comment": null,
  // 	"designation": null,
  // 	"index": 6,
  // 	"name": "Master level",
  // 	"properties": [],
  // 	"rangeSteps": null,
  // 	"ranges": { "default": 0.0, "maximum": 30.0, "minimum": -30.0 },
  // 	"scalePoints": [],
  // 	"shortName": "Master level",
  // 	"symbol": "master",
  // 	"units": { "label": "decibels", "render": "%f dB", "symbol": "dB" }
  //   },

  var box = blessed.box({
    keys: true,
    mouse: true,
    focusable: true,
    top: top,
  });

  var label = blessed.text({
    content: shortName,
    left: 1,
    top: 1,
    // focusable: true,
    // keyable: true,
    // input: true,
  });

  var progress = blessed.progressbar({
    border: {
      type: "line",
      fg: "#512725",
      //   underline: true,
      //   ch: "",
    },
    style: {
      focus: {
        border: {
          fg: "#637373",
        },
        bar: {
          fg: "#5faf5f",
        },
      },
    },
    input: true,
    ch: "░",
    height: 3,
    top: 0,
    left: "35%",
    right: "2",
    filled: value,
    width: "65%",
  });

  progress.key("right", function (a, b) {
    Layout.wlogError(`TODO: INC plugin ${this.id}`);
    Layout.renderScreen();
  });

  box.append(label);
  box.append(progress);

  return box;
}

function make(grid, x, y, xSpan, ySpan) {
  pluginControls = grid.set(y, x, ySpan, xSpan, blessed.box, {
    label: "Plugin Controls",
    input: true,
    mouse: true,
    interactive: true,
    keys: true,
    padding: { left: 1, right: 1 },
    style: {
      focus: {
        border: { fg: "red" },
        //   enabled: false,
      },
    },
  });

  const plugin = store.getSelectedPlugin();

  var token = PubSub.subscribe("selectedPlugin", update);

  return pluginControls;
}

function update(msg, plugin) {
  pluginControls.children = [];
  if (plugin) {
    pluginControls.append(progressControl(45, "param1", 3, "assaassasa"));
    pluginControls.append(progressControl(45, "param2", 6));
    // TODO clear Screen
    return;
  }
}

exports.make = make;
