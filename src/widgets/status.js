const blessed = require("blessed");
const { jack, modHost } = require("../store");
const contrib = require("blessed-contrib");

var status = {};

function make(grid, x, y, xSpan, ySpan) {
  status = grid.set(y, x, ySpan, xSpan, contrib.markdown, {
    label: "Status",
    input: false,
    mouse: false,
    interactive: false,
    keys: false,
    padding: 1,
    style: {
      focus: {
        border: { fg: "red" },
        //   enabled: false,
      },
    },
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

__MOD-HOST:__ ${modHost.STATUS}
__PID:__ ${modHost.PID}
__Port:__ ${modHost.PORT}

`);
}

exports.make = make;
exports.update = update;
