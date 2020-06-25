var { removeNewLines } = require("./string_utils");
let { jack } = require("./store");
const { wlog } = require("./layout");

function init() {
  queryJack();
  updateStatus();
  poll();
}

function poll() {
  if (jack.JACK_STATUS.status === "running") {
    updateStatus();
  } else {
    throw "JACK IS NOT RUNNING";
  }
}

function updateStatus() {
  jack.JACK_STATUS = queryJack();
  jack.TRANSPORT_STATUS = queryTransport();
}

/**
 * Get several Jack Statuses.
 * @returns Returns a json object with each property: status, cpu_load, block_size, realtime, sample_rate
 */
function queryJack() {
  const cp = require("child_process");
  const status = cp.execSync(
    "python3 ./py/jack-audio-tools/transport/client.py -c mod-host-cli-poll query",
    { encoding: "utf8" }
  );
  return JSON.parse(status);
}

function queryTransport() {
  const cp = require("child_process");
  const { wlog } = require("./layout");
  const status = cp.execSync(
    `python3 ./py/jack-audio-tools/transport/transporter.py -c mod-host-cli-poll query`,
    { encoding: "utf8" }
  );
  //   wlog(status);
  return JSON.parse(status);
}

function setTransportStatus(status) {
  //       choices=['query', 'rewind', 'start', 'status', 'stop', 'toggle'],
}

// exports.isJackServerRunning = isJackServerRunning;
exports.init = init;
exports.poll = poll;
exports.queryTransport = queryTransport;
