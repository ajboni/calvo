const Jalv = require("../jalv");
const blessed = require("blessed");
const contrib = require("blessed-contrib");
const PubSub = require("pubsub-js");
const Layout = require("../layout");
const store = require("../store");
const { settings } = require("../../settings");

const PluginControls = function (grid, x, y, xSpan, ySpan) {
  const pluginControls = grid.set(y, x, ySpan, xSpan, blessed.box, {
    label: "Plugin Parameters",
    input: true,
    mouse: true,
    interactive: true,
    keys: true,
    padding: { left: 1, right: 1 },
    mouse: true,
    scrollable: true,

    style: {
      scrollbar: true,
      focus: {
        border: { fg: "red" },
        //   enabled: false,
      },
    },
  });

  pluginControls.key(["down"], (e, x) => {
    Layout.focusNext();
  });

  const plugin = store.getSelectedPlugin();

  PubSub.subscribe("pluginControlsChanged", update);
  PubSub.subscribe("selectedPlugin", (msg, plugin) => {
    if (!plugin) {
      update("", null);
    }
  });
  //  Update all controls for a given plugin (queryin jalv)
  async function update(msg, plugin) {
    const length = JSON.parse(JSON.stringify(pluginControls.children.length));
    for (let index = length - 1; index > 0; index--) {
      const element = pluginControls.children[index];
      element.hide();
    }

    if (!plugin) return;

    // Store the control widget on the plugin instance:
    if (!plugin.info.controlWidgets) plugin.info.controlWidgets = {};

    // const values = await Jalv.getControls(plugin, "controls");
    const values = plugin.info.controls;

    let y = 0;
    plugin.ports.control.input.forEach((control) => {
      if (!plugin.info.controlWidgets[control.symbol]) {
        controlWidget = progressControl(
          values[control.symbol],
          y,
          control,
          plugin
        );
        pluginControls.append(controlWidget);
        plugin.info.controlWidgets[control.symbol] = controlWidget;
      } else {
        plugin.info.controlWidgets[control.symbol].setValue(
          values[control.symbol]
        );
        plugin.info.controlWidgets[control.symbol].show();
      }
      y += 2;
    });
  }

  return pluginControls;
};

/**
 *  Initializes a plugin control widget.
 *   // {
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
 *
 * @param {number} value focused
 * @param {number} top
 * @param {pluginControl} pluginControl 
 * @param {pluginInstance} pluginInstance
 * @returns Returns the progress control blessed widget.
 */
function progressControl(value, top, pluginControl, pluginInstance) {
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
    symbol,
    units,
  } = pluginControl;

  var box = blessed.box({
    interactive: false,
    focusable: false,
    top: top,
  });

  box.value = parseControlValue(pluginControl, value);
  const valuePercent = getControlValuePercent(pluginControl, box.value);

  //    Control Label
  var label = blessed.text({
    content: shortName,
    left: 1,
    top: 1,
    interactive: false,
    focusable: false,
  });

  //    Progress Widget
  var progress = blessed.progressbar({
    border: {
      type: "bg",
      //   fg: "#882822",
      //   bg: "#512725",
    },
    style: {
      bg: "#282828",
      focus: {
        bg: "#1e1e1e",
        border: {
          fg: "#637373",
        },
        bar: {
          bg: "#68955d",
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

  const valueLabelValue = getControlValueLabel(
    pluginControl,
    box.value.toFixed(2)
  );

  var valueLabel = blessed.text({
    content: valueLabelValue,
    right: 4,
    top: 1,
    interactive: false,
    focusable: false,
  });

  box.append(label);
  box.append(progress);
  box.append(valueLabel);

  box.updateValue = function (val) {
    Jalv.setControl(pluginInstance, pluginControl, val);
    const newValue = parseControlValue(pluginControl, val);

    box.value = newValue;
    const _valuePercent = getControlValuePercent(pluginControl, newValue);
    const _valueLabel = getControlValueLabel(
      pluginControl,
      newValue.toFixed(2)
    );
    progress.setProgress(_valuePercent);
    valueLabel.setContent(_valueLabel);
  };

  box.setValue = function (val) {
    const newValue = parseControlValue(pluginControl, val);

    box.value = newValue;
    const _valuePercent = getControlValuePercent(pluginControl, newValue);
    const _valueLabel = getControlValueLabel(
      pluginControl,
      newValue.toFixed(2)
    );
    progress.setProgress(_valuePercent);
    valueLabel.setContent(_valueLabel);
  };

  //   Keyboard action
  progress.key(
    [
      "right",
      "C-right",
      "S-right",
      "left",
      "C-left",
      "S-left",
      "pageup",
      "pagedown",
    ],
    function (e, keys) {
      let newValue = 0;

      // if it is a toggle button, just send 0 or 1
      if (properties.includes("toggled")) {
        if (keys.name === "right") {
          newValue = 1;
        }
      } else {
        let step = settings.DEFAULT_CONTROL_STEP;

        // For small values, (less than 1, make the steps even smaller)
        if (ranges.maximum - ranges.minimum < 1) {
          step = (ranges.maximum - ranges.minimum) / 10;
        }

        // For big values make bigger steps.
        // Need to test if could affect a 'sensible' knob that for example would blast the volume up.
        if (ranges.maximum - ranges.minimum > 100) {
          step = (ranges.maximum - ranges.minimum) / 10;
        }

        // TODO: Not working properly
        if (properties.includes("logarithmic")) {
          // This value indicates into how many evenly-divided points the (control) port range should be divided for step-wise control. This may be used for changing the value with step-based controllers like arrow keys, mouse wheel, rotary encoders, and so on.
          // Note that when used with a logarithmic port, the steps are logarithmic too, and port value can be calculated as:
          // value = lower * pow(upper / lower, step / (steps - 1))
          // and the step from value is:
          //   // step = (steps - 1) * log(value / lower) / log(upper / lower)
          //   step =
          //     (9 * Math.log(box.value / ranges.minimum)) /
          //     Math.log(ranges.maximum / ranges.minimum);
          //   store.wlogDebug("Log Scale");
        }

        if (keys.shift) step /= 10;
        if (keys.ctrl) step *= 5;
        if (keys.name === "pageup") step = -ranges.maximum / 5;
        if (keys.name === "pagedown") step = ranges.maximum / 5;
        if (keys.name === "left") step = -step;
        newValue = box.value + step;

        if (ranges) {
          if (newValue < ranges.minimum) newValue = ranges.minimum;
          if (newValue > ranges.maximum) newValue = ranges.maximum;
        }
      }
      box.updateValue(newValue);
    }
  );

  //   progress.key(["home", "end"], function (e, key) {
  //     if (key.name === "home") Layout.focusPrev();
  //     else if (key.name === "end") Layout.focusNext();
  //   });

  progress.key(["up", "down"], function (e, key) {
    if (key.name === "up") Layout.focusPrev();
    else if (key.name === "down") Layout.focusNext();
  });

  //   progress.key("S-right", function (a, b) {
  //     box.updateValue(box.value + settings.DEFAULT_CONTROL_MEDIUM_STEP);
  //   });

  //   progress.key("left", function (a, b) {
  //     box.updateValue(box.value - settings.DEFAULT_CONTROL_SMALL_STEP);
  //   });

  //   progress.key("S-right", function (a, b) {
  //     box.updateValue(box.value + settings.DEFAULT_CONTROL_MEDIUM_STEP);
  //   });
  return box;
}

/**
 * Returns a relative percent of a value for a plugin control.
 * Uses rangeMax and RangeMin
 *
 * @param {puglinControl} control plugin control.
 * @param {number} value Value to calculate %
 */
function getControlValuePercent(control, value) {
  const parsedValue = control.properties.includes("integer")
    ? parseInt(value)
    : parseFloat(value);
  const valuePercent =
    // (parsedValue / (control.ranges.minimum + control.ranges.maximum)) * 100;
    ((parsedValue - control.ranges.minimum) /
      (control.ranges.maximum - control.ranges.minimum)) *
    100;

  return valuePercent;
}

/**
 * Creates a label for a specific control.
 *
 * @param {*} control Plugin control
 * @param {*} value Value to append to the label
 * @returns Returns a label with units if applicable and formatted according to the LV2 specification.
 */
function getControlValueLabel(control, value) {
  let valueLabelValue = value;
  const parsedValue = parseControlValue(control, value);
  if (Object.keys(control.units).length > 0) {
    valueLabelValue = control.units.render.replace("%f", valueLabelValue);
  }
  ///"units": { "label": "decibels", "render": "%f dB", "symbol": "dB" }
  if (control.properties.includes("toggled")) {
    valueLabelValue = parsedValue === 1 ? "ON" : "OFF";
  }
  if (control.properties.includes("enumeration")) {
    const options = control.scalePoints.length;

    const option = control.scalePoints.filter((x) => x.value === parsedValue);

    if (option[0]) valueLabelValue = option[0].label;
  }

  return valueLabelValue;
}

/**
 * Parse a control value, usually a float except if defined in properties.
 * TODO: Check other cases.
 *
 * @param {pluginControl} control
 * @param {string} value
 * @returns a float or an int with the value
 */
function parseControlValue(control, value) {
  const parsedValue = control.properties.includes("integer")
    ? parseInt(value)
    : parseFloat(value);
  return parsedValue;
}

exports.parseControlValue = parseControlValue;
exports.getControlValueLabel = getControlValueLabel;
exports.getControlValuePercent = getControlValuePercent;
exports.PluginControls = PluginControls;
