/**
 * Audio Input/Output widget.
 * @module widgets
 */

const blessed = require("blessed");
const contrib = require("blessed-contrib");
const PubSub = require("pubsub-js");
const store = require("../store");

/**
 * @variation audioIO
 * @param {*} grid
 * @param {*} x
 * @param {*} y
 * @param {*} xSpan
 * @param {*} ySpan
 * @param {*} mode Mode should be input or output
 * @returns Returns the newly generated widget.
 */
const IOWidget = function (grid, x, y, xSpan, ySpan, mode) {
  const ioWidget = grid.set(y, x, ySpan, xSpan, blessed.box, {
    label: mode.toUpperCase(),
    mouse: true,
    interactive: true,
    keys: true,
    padding: { left: 1, right: 1 },
    scrollable: true,
    style: {
      border: { fg: "#7ea87f" },
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

  const sources =
    mode === "input"
      ? store.getJackStatus().PORTS.audio.capture
      : store.getJackStatus().PORTS.audio.playback;

  const monoCheckbox = blessed.checkbox({ text: "Mono " + mode, top: 1 });

  //   	LEFT CHANNEL SELECTOR
  const leftChannelBox = blessed.box({
    width: "45%",
    left: 0,
    top: 3,
  });

  const lRadioSet = blessed.radioset({ label: "LEFT" });

  for (let index = 0; index < sources.length; index++) {
    const element = sources[index];
    const radio = blessed.radiobutton({ content: element, top: index + 2 });
    if (element === store.app.SETTINGS[mode.toUpperCase() + "_L"]) {
      radio.checked = true;
    }
    radio.on("check", () => {
      store.setAudioSource(mode, "left", element);
    });
    lRadioSet.append(radio);
  }
  leftChannelBox.append(lRadioSet);

  //   RIGHT CHANNEL SELECTOR
  const rightChannelBox = blessed.box({
    width: "45%",
    left: "50%",
    top: 3,
  });

  const rRadioSet = blessed.radioset({ label: "RIGHT" });

  for (let index = 0; index < sources.length; index++) {
    const element = sources[index];
    const radio = blessed.radiobutton({ content: element, top: index + 2 });
    if (element === store.app.SETTINGS[mode.toUpperCase() + "_R"]) {
      radio.checked = true;
    }
    radio.on("check", () => {
      store.setAudioSource(mode, "right", element);
    });
    rRadioSet.append(radio);
  }
  rightChannelBox.append(rRadioSet);
  rightChannelBox.hidden =
    store.app.SETTINGS[mode.toUpperCase() + "_MODE"] === "mono";

  //  EVENTS
  monoCheckbox.on("check", () => store.setAudioSourceMode(mode, "mono"));
  monoCheckbox.on("uncheck", () => store.setAudioSourceMode(mode, "stereo"));

  ioWidget.append(monoCheckbox);
  ioWidget.append(leftChannelBox);
  ioWidget.append(rightChannelBox);

  var token = PubSub.subscribe("settings", (m, j) =>
    update(m, j, mode, rightChannelBox)
  );

  store.app.SETTINGS[mode.toUpperCase() + "_MODE"] === "mono"
    ? (monoCheckbox.checked = true)
    : (monoCheckbox.checked = false);

  function update(msg, jackStatus, mode, rightChannelBox) {
    if (store.app.SETTINGS[mode.toUpperCase() + "_MODE"] === "mono")
      rightChannelBox.hide();
    else rightChannelBox.show();
  }

  return ioWidget;
};

module.exports = IOWidget;
