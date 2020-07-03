const blessed = require("blessed");
const contrib = require("blessed-contrib");
const PubSub = require("pubsub-js");
const store = require("../store");

var inputWidget = {};

function make(grid, x, y, xSpan, ySpan) {
  inputWidget = grid.set(y, x, ySpan, xSpan, blessed.box, {
    label: "Input",
    mouse: true,
    interactive: true,
    keys: true,
    padding: { left: 1, right: 1 },
    scrollable: true,
    style: {
      selected: {
        bg: "#4d5e4d",
        fg: "#FFFFFF",
        bold: true,
      },
      focus: {
        border: { fg: "red" },
        enabled: false,
        selected: {
          bg: "#689d6a",
          fg: "#FFFFFF",
          bold: true,
        },
      },
    },
  });
  const monoCheckbox = blessed.checkbox({ text: "Mono", top: 1 });

  const leftChannelBox = blessed.box({
    label: "Left",
    width: "50%",
    left: "0",
    top: 3,
  });

  const lRadioSet = blessed.radioset();
  const inputs = store.getJackStatus().PORTS.audio.capture;

  for (let index = 0; index < inputs.length; index++) {
    const element = inputs[index];
    const radio = blessed.radiobutton({ content: element, top: index + 1 });
    lRadioSet.append(radio);
  }

  const radio3 = blessed.radiobutton({ content: "s", top: 5 });
  lRadioSet.append(radio3);
  const radio2 = blessed.radiobutton({ content: "sss", top: 6 });
  lRadioSet.append(radio2);
  const radio4 = blessed.radiobutton({ content: "zzz", top: 7 });
  lRadioSet.append(radio4);
  const radio5 = blessed.radiobutton({ content: "asdadszzz", top: 8 });
  lRadioSet.append(radio5);

  leftChannelBox.append(lRadioSet);

  const rightChannelBox = blessed.box({
    label: "Right",
    width: "33%",
    left: "50%",
    top: 3,
  });

  monoCheckbox.on("check", () =>
    changeMode("mono", leftChannelBox, rightChannelBox)
  );
  monoCheckbox.on("uncheck", () =>
    changeMode("stereo", leftChannelBox, rightChannelBox)
  );
  inputWidget.append(monoCheckbox);
  inputWidget.append(leftChannelBox);
  inputWidget.append(rightChannelBox);
  //   var token = PubSub.subscribe("selectedPlugin", update);

  return inputWidget;
}

function changeMode(mode, l, r) {
  if (mode === "mono") {
    r.hidden = true;
    l.width = "90%";
  } else {
    r.hidden = false;
    l.width = "50%";
  }

  // inputWidget.append(blessed.checkbox({ text: "aaa", top: 3 }));
  // inputWidget.append(blessed.checkbox({ text: "eee", top: 4 }));
  // inputWidget.append(blessed.checkbox({ text: "ccc", top: 5 }));
}

function update(msg, plugin) {}

exports.make = make;
