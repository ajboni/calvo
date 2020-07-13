const blessed = require("blessed");
const contrib = require("blessed-contrib");
const PubSub = require("pubsub-js");
const store = require("../store");

/**
 *
 * @param {*} grid
 * @param {*} x
 * @param {*} y
 * @param {*} xSpan
 * @param {*} ySpan
 * @param {*} mode Mode should be input or output
 * @returns Returns the newly generated widget.
 */
function make(grid, x, y, xSpan, ySpan, mode) {
  const ioWidget = grid.set(y, x, ySpan, xSpan, blessed.box, {
    label: mode.toUpperCase(),
    mouse: true,
    interactive: true,
    keys: true,
    padding: { left: 1, right: 1 },
    scrollable: true,
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
    if (element === store.getJackStatus().CONNECTIONS[mode + "Left"]) {
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
    if (element === store.getJackStatus().CONNECTIONS[mode + "Right"]) {
      radio.checked = true;
    }
    radio.on("check", () => {
      store.setAudioSource(mode, "right", element);
    });
    rRadioSet.append(radio);
  }
  rightChannelBox.append(rRadioSet);
  rightChannelBox.hidden =
    store.getJackStatus().CONNECTIONS[mode + "Mode"] === "mono";

  //  EVENTS
  monoCheckbox.on("check", () => store.setAudioSourceMode(mode, "mono"));
  monoCheckbox.on("uncheck", () => store.setAudioSourceMode(mode, "stereo"));

  ioWidget.append(monoCheckbox);
  ioWidget.append(leftChannelBox);
  ioWidget.append(rightChannelBox);

  var token = PubSub.subscribe("jack", (m, j) =>
    update(m, j, mode, rightChannelBox)
  );

  store.getJackStatus().CONNECTIONS[mode + "Mode"] === "mono"
    ? (monoCheckbox.checked = true)
    : (monoCheckbox.checked = false);

  return ioWidget;
}

function update(msg, jackStatus, mode, rightChannelBox) {
  if (jackStatus.CONNECTIONS[mode + "Mode"] === "mono") rightChannelBox.hide();
  else rightChannelBox.show();
}

exports.make = make;
