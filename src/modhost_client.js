const { wlog, wlogError } = require("./layout");
const { removeNewLines } = require("./string_utils");
const getPort = require("get-port");
const { settings } = require("../settings");
const store = require("./store");
const Layout = require("./layout");

var net = require("net");
var client = new net.Socket();

/** Exec mod-host, get the PID and the ephemeral ports. */
async function init() {
  const port = await getPort({
    port: getPort.makeRange(
      settings.MOD_HOST_PORT_START,
      settings.MOD_HOST_PORT_END
    ),
  });

  store.modHost.PORT = port;
  store.modHost.FEEDBACK_PORT = port + 1;

  // In the future we might want to start a docker container, or reach a host on the network.
  // For now we just spaqn a child process.
  await spawn(port);
  await connect();
}

/** Kill modhost process. */
function destroy() {
  //   const cp = require("child_process");
  //   cp.execSync(`kill ${store.modHost.PID}`);
  client.write("quit", "utf8");
}

/**
 * Spawn a mod-host process
 * @param {*} port Port that the mod-host server is listening for connections.
 */
async function spawn(port) {
  const { spawn } = require("child_process");
  const { wlog } = require("./layout");

  const mh = await spawn("mod-host", ["-n", `-p ${port}`]);

  store.modHost.PID = mh.pid;

  mh.stdout.on("data", (data) => {
    wlog(`[MH] ${data}`);
    if (data.includes("mod-host ready!")) {
      store.modHost.STATUS = store.modHostStatusEnum.StartedDisconnected;
    }
  });

  mh.stderr.on("data", (data) => {
    wlog(`[MH] *ERROR* ${data}`);
  });

  mh.on("close", (code) => {
    wlog(`[MH] Mod Host process exited with code ${code}`);
  });
}

/**
 * Connects to modhost server.
 * @param {*} [server=settings.MOD_HOST_SERVER] Ip Address of the server
 * @param {*} [port=store.modHost.PORT] Port that mod-host server is listening
 */
async function connect(
  server = settings.MOD_HOST_SERVER,
  port = store.modHost.PORT
) {
  const { wlog } = require("./layout");
  var elapsedTime = 0;

  // Try timeout times, wait 1 second between each try.
  while (
    store.modHost.STATUS !== store.modHostStatusEnum.StartedDisconnected &&
    elapsedTime <= settings.DEFAULT_TIMEOUT
  ) {
    await sleep(1000);
    elapsedTime += 1000;
  }

  client.connect({
    port: port,
    host: server,
  });

  //   client.setTimeout(5e3, () => client.destroy());

  client.once("connect", (data) => {
    wlog("[MH] Connected to mod-host.");
    store.modHost.STATUS = store.modHostStatusEnum.Connected;
    client.setTimeout(0);
    //  client.write("help");
  });

  client.on("data", function (data) {
    wlog(`[MH] ${data}`);
    //  console.log(data);
  });

  client.on("error", function (data) {
    wlogError("[MH] Cannot connect to Mod-Host: " + data);
  });

  client.on("close", function () {
    console.log("Connection closed");
  });
}

/**
 * Waits for x milliseconds.
 * @param {*} ms Time to wait.
 * @returns Returns a promise
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * add an LV2 plugin encapsulated as a jack client
 * e.g.: add http://lv2plug.in/plugins/eg-amp 0
 * instance_number must be any value between 0 ~ 9999, inclusively
 *
 * @param {*} uri
 * @param {*} instanceNumber
 */
function addPlugin(uri, instanceNumber) {
  const plugin = client.write(`add ${uri} ${instanceNumber}`, "utf8");
}

/**
 * remove <instance_number>
 * * remove an LV2 plugin instance (and also the jack client)
 * e.g.: remove 0

 */
function removePlugin(instanceNumber) {
  const resp = client.write(`remove ${instanceNumber}`, "utf8");
}

/**
 *bypass <instance_number> <bypass_value>
 * toggle effect processing
 * e.g.: bypass 0 1
 * if bypass_value = 1 bypass effect
 * if bypass_value = 0 process effect *
 * @param {*} instanceNumber
 * @param {*} value
 */
function bypassPlugin(instanceNumber, value) {
  const resp = client.write(`remove ${instanceNumber} ${value}`, "utf8");
}

/**
 * connect <origin_port> <destination_port>
 * connect two effect audio ports
 * e.g.: connect system:capture_1 effect_0:in
 * @param {*} src
 * @param {*} dst
 */
async function connectPorts(src, dst) {
  const msg = `connect ${src} ${dst} \0`;
  Layout.wlog(msg);
  client.write(msg, "utf8");
}

/**
 * disconnect <origin_port> <destination_port>
 * * disconnect two effect audio ports
 *  e.g.: disconnect system:capture_1 effect_0:in
 *
 * @param {*} src
 * @param {*} dst
 */
async function disconnectPorts(src, dst) {
  client.write(`disconnect ${src} ${dst}`, "utf8");
}

/**
 * It will connect two plugins, dealing with mono/stereo conversions.
 * Use 'input|output' to use a mono/stero I/O ports as src/dst.
 *
 * @param {*} src plugin to connect, should be taken from rack as it will use the instance number.
 * @param {*} dst
 */
/**
 *
 *
 * @param {*} src
 * @param {*} dst
 * @returns
 */
function connectPlugins(src, dst) {
  const il = store.getJackStatus().CONNECTIONS.inputLeft;
  const ir = store.getJackStatus().CONNECTIONS.inputRight;
  const im = store.getJackStatus().CONNECTIONS.inputMode;
  const ol = store.getJackStatus().CONNECTIONS.outputLeft;
  const or = store.getJackStatus().CONNECTIONS.outputRight;
  const om = store.getJackStatus().CONNECTIONS.outputMode;

  //   Direct Monitor not supported right now (It may conflict on multi instance mode.)
  if (src === "input" && dst === "output") {
    return;
  }

  //  Input => Plugin
  if (src === "input") {
    if (!dst.ports.audio || dst.ports.audio.length === 0) {
      Layout.wlog(
        "Dst plugin does not have correct number of ports or does not exist."
      );
      return;
    }
    const dstMode = dst.ports.audio.length === 1 ? "mono" : "stereo";
    const dl = `effect_${dst.info.instanceNumber}:${dst.ports.audio.input[0].symbol}`;
    const dr =
      dstMode === "stereo"
        ? `effect_${dst.info.instanceNumber}:${dst.ports.audio.input[1].symbol}`
        : "";

    if (im === "mono" && dstMode === "mono") {
      connectPorts(il, dl);
    } else if (im === "mono" && dstMode === "stereo") {
      connectPorts(il, dl);
      connectPorts(il, dr);
    } else if (im === "stereo" && dstMode === "mono") {
      connectPorts(il, dl);
      //   connectPorts(ir, dst.ports.audio.input[0].symbol);
    } else if (im === "stereo" && dstMode === "stereo") {
      connectPorts(il, dl);
      //   connectPorts(ir, dst.ports.audio.input[1].symbol);
    }
  }

  //   Plugin => Output
  if (dst === "output") {
  }
  //   Plugin => Plugin
  else {
  }
  //   console.log(dst.ports.audio.input);
}

/**
 * It will disconnect two plugins, dealing with mono/stereo conversions.
 * Use 'input|output' to use a mono/stero I/O ports as src/dst.
 *
 * @param {*} src source plugin to disconnect (output ports), should be taken from rack as it will use the instance number.
 * @param {*} dst destination plugin to disconnect (input ports), should be taken from rack as it will use the instance number.
 */
function disconnectPlugins(src, dst) {
  const il = store.getJackStatus().CONNECTIONS.inputLeft;
  const ir = store.getJackStatus().CONNECTIONS.inputRight;
  const im = store.getJackStatus().CONNECTIONS.inputMode;
  const ol = store.getJackStatus().CONNECTIONS.outputLeft;
  const or = store.getJackStatus().CONNECTIONS.outputRight;
  const om = store.getJackStatus().CONNECTIONS.outputMode;

  // If we are connecting input to output
  if (src === "input" && dst === "output") {
    return;
  }
}

async function sequencialCall(fnArray) {
  // TODO, execute client.write secquencially.
}

exports.connect = connect;
exports.init = init;
exports.destroy = destroy;
exports.addPlugin = addPlugin;
exports.removePlugin = removePlugin;
exports.bypassPlugin = bypassPlugin;
exports.connectPorts = connectPorts;
exports.disconnectPorts = disconnectPorts;
exports.connectPlugins = connectPlugins;
exports.disconnectPlugins = disconnectPlugins;
