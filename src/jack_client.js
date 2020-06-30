let store = require("./store");
const Layout = require("./layout");

function init() {
  queryJack();
  updateStatus();
  poll();
}

function poll() {
  if (store.jack.JACK_STATUS.status === "running") {
    updateStatus();
  } else {
    throw "JACK IS NOT RUNNING";
  }
}

function updateStatus() {
  store.jack.JACK_STATUS = queryJack();
  store.jack.TRANSPORT_STATUS = queryTransport();
  store.jack.PORTS = getAvailableJackPorts();
}

/**
 * Get several Jack Statuses.
 * @returns Returns a json object with each property: status, cpu_load, block_size, realtime, sample_rate
 */
function queryJack() {
  const cp = require("child_process");
  const status = cp.execSync(
    "python3 ./py/jack-audio-tools/jack/client.py -c mod-host-cli-poll query",
    { encoding: "utf8" }
  );
  return JSON.parse(status);
}

function queryTransport() {
  const cp = require("child_process");
  const status = cp.execSync(
    `python3 ./py/jack-audio-tools/jack/transporter.py -c mod-host-cli-poll query`,
    { encoding: "utf8" }
  );
  //   wlog(status);
  return JSON.parse(status);
}

function setTransportStatus(status) {
  //       choices=['query', 'rewind', 'start', 'status', 'stop', 'toggle'],
}

function getAvailableJackPorts() {
  const cp = require("child_process");
  const info = cp.execSync(
    `python3 ./py/jack-audio-tools/jack/client.py -c mod-host-cli-poll port-info`,
    { encoding: "utf8" }
  );
  return JSON.parse(info);
}
// exports.isJackServerRunning = isJackServerRunning;
exports.init = init;
exports.poll = poll;
exports.queryTransport = queryTransport;
