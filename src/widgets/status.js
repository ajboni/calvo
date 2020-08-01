const blessed = require("blessed");
const contrib = require("blessed-contrib");
const PubSub = require("pubsub-js");
const store = require("../store");

var status = {};
var jack = store.getJackStatus();

function make(grid, x, y, xSpan, ySpan) {
  status = grid.set(y, x, ySpan, xSpan, contrib.markdown, {
    label: "Status",
    input: false,
    mouse: false,
    interactive: false,
    keys: false,
    padding: 1,
    style: {
      border: { fg: "#7ea87f" },
      focus: {
        border: { fg: "red" },
        //   enabled: false,
      },
    },
  });

  PubSub.subscribe("jack", function (msg, jackStatus) {
    jack = jackStatus;
    update();
  });

  return status;
}

function update() {
  status.setMarkdown(`
__JACK__: \`${jack.JACK_STATUS.status} ${
    jack.JACK_STATUS.realtime ? "(RT)" : ""
  }\`
__Sample Rate:__ ${jack.JACK_STATUS.sample_rate} 
__Buffer:__ ${jack.JACK_STATUS.block_size}
__DSP Load:__ ${jack.JACK_STATUS.cpu_load.toFixed(2)} %
__Transport__: ${jack.TRANSPORT_STATUS.state}
__Time__: ${jack.TRANSPORT_STATUS.beats_per_bar}/${
    jack.TRANSPORT_STATUS.beat_type
  } @ ${jack.TRANSPORT_STATUS.beats_per_minute} bpm


`);
}

exports.make = make;
// exports.update = update;
