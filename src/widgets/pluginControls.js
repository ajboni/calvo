const Jalv = require("../jalv");
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

  // TODO: COnvert to percent

  const parsedValue = properties.includes("integer")
    ? parseInt(value)
    : parseFloat(value);

  const valuePercent = (parsedValue / (ranges.minimum + ranges.maximum)) * 100;
  Layout.wlogError(valuePercent);

  var box = blessed.box({
    interactive: false,
    top: top,
  });

  var label = blessed.text({
    content: shortName,
    left: 1,
    top: 1,
    interactive: false,
  });

  var progress = blessed.progressbar({
    border: {
      type: "line",
      fg: "#512725",
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
    right: "8",
    filled: parseInt(valuePercent.toString()),
    width: "65%",
  });

  progress.key("right", function (a, b) {
    Jalv.getControls(store.rack[0]);
  });

  let valueLabelValue = parsedValue.toFixed(2);
  if (Object.keys(units).length > 0) {
    ///"units": { "label": "decibels", "render": "%f dB", "symbol": "dB" }
    valueLabelValue = units.render.replace("%f", valueLabelValue);
  }

  if (properties.includes("toggled")) {
    valueLabelValue = parsedValue === 1 ? "ON" : "OFF";
  }

  var valueLabel = blessed.text({
    content: valueLabelValue,
    right: 4,
    top: 1,
    interactive: false,
  });

  box.append(label);
  box.append(progress);
  box.append(valueLabel);
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

async function update(msg, plugin) {
  pluginControls.children = [];
  const values = await Jalv.getControls(plugin, "controls");
  if (plugin) {
    let y = 0;
    plugin.ports.control.input.forEach((control) => {
      y += 2;
      const value = 50;
      pluginControls.append(
        progressControl(values[control.symbol], y, control)
      );
    });

    // pluginControls.append(progressControl(45, "param1", 3, "assaassasa"));
    // TODO clear Screen
    return;
  }
}

exports.make = make;
