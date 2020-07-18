/**
 * Query JACK info and status. uses https://github.com/ajboni/jack-audio-tools
 * @module jack_client
 */

let store = require("./store");
const Layout = require("./layout");
const PubSub = require("pubsub-js");

let jack;

PubSub.subscribe("jack", function (jackStatus) {
  jack = jackStatus;
});

/**
 * Initialize. Set up polling.
 *
 */
function init() {
  //   queryJack();
  updateStatus();
  poll();
}

/**
 * Poll JACK for info.
 * @see settings
 */
function poll() {
  if (store.getJackStatus().JACK_STATUS.status === "running") {
    updateStatus();
  } else {
    throw "JACK IS NOT RUNNING";
  }
}

function updateStatus() {
  store.setJackStatus(queryJack(), queryTransport(), getAvailableJackPorts());
}

/**
 * Get several Jack Statuses.
 * @returns Returns a json object with each property: status, cpu_load, block_size, realtime, sample_rate
 */
function queryJack() {
  const cp = require("child_process");
  const status = cp.execSync(
    "python3 ./py/calvo_cli_tools/jack_tools/client.py -c calvo-poll query",
    { encoding: "utf8" }
  );
  return JSON.parse(status);
}

/**
 * Queries JACK transport to get status.
 *
 * @returns Returns a JSON object with the JACK transport status.
 */
function queryTransport() {
  const cp = require("child_process");
  const status = cp.execSync(
    `python3 ./py/calvo_cli_tools/jack_tools/transporter.py -c calvo-poll query`,
    { encoding: "utf8" }
  );
  return JSON.parse(status);
}

function setTransportStatus(status) {
  //       choices=['query', 'rewind', 'start', 'status', 'stop', 'toggle'],
}

/**
 * Get all available JACK audio/midi input/output ports.
 *
 * @returns Returns a JSON object with all available ports.
 */
function getAvailableJackPorts() {
  const cp = require("child_process");
  const info = cp.execSync(
    `python3 ./py/calvo_cli_tools/jack_tools/client.py -c calvo-poll port-info`,
    { encoding: "utf8" }
  );
  return JSON.parse(info);
}

/**
 * connect <origin_port> to <destination_port>
 * connect two jack ports together. Both ports must be same type.
 * @param {string} src Origin port: Must be an output port.
 * @param {string} dst Destination port: Must be an Input port
 */
async function connectPorts(src, dst, disconnect = false, quiet = true) {
  const cp = require("child_process");
  const rm = disconnect ? "--disconnect" : "";
  const q = quiet ? "--quiet" : "";
  try {
    const status = cp.execSync(
      `python3 ./py/calvo_cli_tools/jack_tools/port_tools.py connect ${src} ${dst} ${rm} ${q}`,
      { encoding: "utf8" }
    );
  } catch (error) {
    Layout.wlogError(error);
  }
}

/**
 * It will (dis) connect two plugins, dealing with mono/stereo conversions.
 * Use 'input|output' to use a mono/stero I/O ports as src/dst.
 * @param {plugin} src Source plugin instance. It should exist on the RACK. It will use the plugin's output ports.
 * @param {plugin} dst Destination plugin.It should exist on the RACK. It will use the plugin's input ports.
 * @param {boolean} [disconnect=false] Disconnect plugins
 */
function connectPlugins(src, dst, disconnect = false) {
  const il = store.getJackStatus().CONNECTIONS.inputLeft;
  const ir = store.getJackStatus().CONNECTIONS.inputRight;
  const im = store.getJackStatus().CONNECTIONS.inputMode;
  const ol = store.getJackStatus().CONNECTIONS.outputLeft;
  const or = store.getJackStatus().CONNECTIONS.outputRight;
  const om = store.getJackStatus().CONNECTIONS.outputMode;
  const instanceName = `calvo_${store.app.APP_ID}`;

  //   Direct Monitor not supported right now (It may conflict on multi instance mode.)
  if (src === "input" && dst === "output") {
    Layout.wlogError(
      "Direct Monitor not supported right now (It may conflict on multi instance mode.)"
    );
    return;
  }

  //  Input => Plugin
  if (src === "input") {
    if (!dst.ports.audio.input || dst.ports.audio.input.length === 0) {
      Layout.wlog(
        "Dst plugin does not have correct number of ports or does not exist."
      );
      return;
    }

    const dstMode = dst.ports.audio.input.length === 1 ? "mono" : "stereo";
    const dl = `${instanceName}_${dst.info.instanceNumber}_${dst.info.safeName}:${dst.ports.audio.input[0].symbol}`;
    const dr =
      dstMode === "stereo"
        ? `${instanceName}_${dst.info.instanceNumber}_${dst.info.safeName}:${dst.ports.audio.input[1].symbol}`
        : "";

    if (im === "mono" && dstMode === "mono") {
      connectPorts(il, dl, disconnect);
    } else if (im === "mono" && dstMode === "stereo") {
      connectPorts(il, dl, disconnect);
      connectPorts(il, dr, disconnect);
    } else if (im === "stereo" && dstMode === "mono") {
      connectPorts(il, dl, disconnect);
      connectPorts(ir, dl, disconnect);
    } else if (im === "stereo" && dstMode === "stereo") {
      connectPorts(il, dl, disconnect);
      connectPorts(ir, dr, disconnect);
    }
  }

  //   Plugin => Output
  else if (dst === "output") {
    if (!src.ports.audio.output || src.ports.audio.output.length === 0) {
      Layout.wlog(
        "src plugin does not have correct number of ports or does not exist."
      );
      return;
    }
    const srcMode = src.ports.audio.output.length === 1 ? "mono" : "stereo";
    const sl = `${instanceName}_${src.info.instanceNumber}_${src.info.safeName}:${src.ports.audio.output[0].symbol}`;
    const sr =
      srcMode === "stereo"
        ? `${instanceName}_${src.info.instanceNumber}_${src.info.safeName}:${src.ports.audio.output[1].symbol}`
        : "";

    if (srcMode === "mono" && om === "mono") {
      connectPorts(sl, ol, disconnect);
    } else if (srcMode === "mono" && om === "stereo") {
      connectPorts(sl, ol, disconnect);
      connectPorts(sl, or, disconnect);
    } else if (srcMode === "stereo" && om === "mono") {
      connectPorts(sl, ol, disconnect);
      connectPorts(sr, ol, disconnect);
    } else if (srcMode === "stereo" && om === "stereo") {
      connectPorts(sl, ol, disconnect);
      connectPorts(sr, or, disconnect);
    }
  }
  //   Plugin => Plugin
  else {
    if (!src.ports.audio.output || src.ports.audio.output.length === 0) {
      Layout.wlog(
        "src plugin does not have correct number of ports or does not exist."
      );
      return;
    }

    if (!dst.ports.audio.input || dst.ports.audio.input.length === 0) {
      Layout.wlog(
        "dst plugin does not have correct number of ports or does not exist."
      );
      return;
    }

    const srcMode = src.ports.audio.output.length === 1 ? "mono" : "stereo";
    const sl = `${instanceName}_${src.info.instanceNumber}_${src.info.safeName}:${src.ports.audio.output[0].symbol}`;
    const sr =
      srcMode === "stereo"
        ? `${instanceName}_${src.info.instanceNumber}_${src.info.safeName}:${src.ports.audio.output[1].symbol}`
        : "";

    const dstMode = dst.ports.audio.input.length === 1 ? "mono" : "stereo";
    const dl = `${instanceName}_${dst.info.instanceNumber}_${dst.info.safeName}:${dst.ports.audio.input[0].symbol}`;
    const dr =
      dstMode === "stereo"
        ? `${instanceName}_${dst.info.instanceNumber}_${dst.info.safeName}:${dst.ports.audio.input[1].symbol}`
        : "";

    if (srcMode === "mono" && dstMode === "mono") {
      connectPorts(sl, dl, disconnect);
    } else if (srcMode === "mono" && dstMode === "stereo") {
      connectPorts(sl, dl, disconnect);
      connectPorts(sl, dr, disconnect);
    } else if (srcMode === "stereo" && dstMode === "mono") {
      connectPorts(sl, dl, disconnect);
      connectPorts(sr, dl, disconnect);
    } else if (srcMode === "stereo" && dstMode === "stereo") {
      connectPorts(sl, dl, disconnect);
      connectPorts(sr, dr, disconnect);
    }
  }
}

/**
 * Alias for connect(src, dst, { disconnect: true })
 * It will (dis) connect two plugins, dealing with mono/stereo conversions.
 * Use 'input|output' to use a mono/stero I/O ports as src/dst.
 * @param {plugin} src Source plugin instance. It should exist on the RACK. It will use the plugin's output ports.
 * @param {plugin} dst Destination plugin.It should exist on the RACK. It will use the plugin's input ports.
 * @param {boolean} [disconnect=true]
 */
function disconnectPlugins(src, dst, disconnect = true) {
  connectPlugins(src, dst, disconnect);
}

/**
 * Disconnect all plugin ports from any target.
 *
 * @param {plugin} plugin Plugin Instance
 * @param {string} direction [all|input|output] What ports to disconnect.
 *
 */
function clearPluginPorts(plugin, direction = "all") {
  const cp = require("child_process");
  const arr = [];

  if (direction === "all" || direction === "input") {
    arr.push(...plugin.ports.audio.input);
  }
  if (direction === "all" || direction === "output") {
    arr.push(...plugin.ports.audio.output);
  }
  const instanceName = `calvo_${store.app.APP_ID}`;

  const ports = arr
    .map(
      (port) =>
        `${instanceName}_${plugin.info.instanceNumber}_${plugin.info.safeName}:${port.symbol}`
    )
    .join(",");
  //   Layout.wlog(ports);

  try {
    const status = cp.execSync(
      `python3 ./py/calvo_cli_tools/jack_tools/port_tools.py clear ${ports}`,
      { encoding: "utf8" }
    );
  } catch (error) {
    Layout.wlogError(error.toString());
  }
}

exports.init = init;
exports.poll = poll;
exports.queryTransport = queryTransport;
exports.connectPlugins = connectPlugins;
exports.disconnectPlugins = disconnectPlugins;
exports.clearPluginPorts = clearPluginPorts;
