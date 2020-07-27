const Jalv = require("../jalv");
const blessed = require("blessed");
const contrib = require("blessed-contrib");
const PubSub = require("pubsub-js");
const Layout = require("../layout");
const store = require("../store");
const { settings } = require("../../settings");
const {
  getControlValueLabel,
  getControlValuePercent,
  parseControlValue,
} = require("./pluginControls");

/** Monitors the output for the selected plugin **/
const PluginMonitor = function (grid, x, y, xSpan, ySpan) {
  const pluginMonitor = grid.set(y, x, ySpan, xSpan, blessed.box, {
    label: "Plugin Monitor",
    input: false,
    interactive: false,
    keys: false,
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

  const plugin = store.getSelectedPlugin();
  var token = PubSub.subscribe("selectedPlugin", update);

  //  Update all controls for a given plugin
  async function update(msg, plugin) {
    const length = JSON.parse(JSON.stringify(pluginMonitor.children.length));
    for (let index = length - 1; index > 0; index--) {
      const element = pluginMonitor.children[index];
      element.hide();
    }

    if (!plugin) return;

    if (plugin.ports.control.output.length === 0) {
      pluginMonitor.append(
        blessed.text({ content: "No monitor ports on selected plugin." })
      );
    }

    // Store the control widget on the plugin instance:
    if (!plugin.info.monitorWidgets) plugin.info.monitorWidgets = {};

    let y = 0;
    plugin.ports.control.output.forEach((control) => {
      if (!plugin.info.monitorWidgets[control.symbol]) {
        monitorWidget = progressControl(0, y, control, plugin);
        pluginMonitor.append(monitorWidget);
        plugin.info.monitorWidgets[control.symbol] = monitorWidget;
      } else {
        plugin.info.monitorWidgets[control.symbol].show();
      }
      y += 2;
    });
  }

  PubSub.subscribe("pluginMonitorsChanged", updateValues);
  async function updateValues(msg, plugin) {
    if (!plugin) return;
    const values = plugin.info.monitors;

    plugin.ports.control.output.forEach((control) => {
      if (values[control.symbol]) {
        plugin.info.monitorWidgets[control.symbol].setValue(
          values[control.symbol]
        );
      }

      plugin.info.monitorWidgets[control.symbol].show();
    });

    // store.wlogDebug(JSON.stringify(values));
  }
  return pluginMonitor;
};

/**
 *  Initializes a plugin control widget.
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
    interactive: false,
    focusable: false,
    keyable: false,
    keys: false,
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

  return box;
}

module.exports = PluginMonitor;
