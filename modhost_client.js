const shell = require("shelljs");
const { wlog, wlogError } = require("./layout");
const { removeNewLines } = require("./string_utils");
const getPort = require("get-port");
const { settings } = require("./settings");
var net = require("net");
const { modHost, modHostStatusEnum } = require("./store");

/** Exec mod-host, get the PID and the ephemeral ports. */
async function init() {
  const port = await getPort({
    port: getPort.makeRange(
      settings.MOD_HOST_PORT_START,
      settings.MOD_HOST_PORT_END
    ),
  });

  modHost.PORT = port;
  modHost.FEEDBACK_PORT = port + 1;

  // In the future we might want to start a docker container, or reach a host on the network.
  // For now we just spaqn a child process.
  await spawn(port);
  await connect();
}

/** Kill modhost process. */
function destroy() {
  shell.exec(`kill ${modHost.PID}`);
}

// Spawn a mod-host process
async function spawn(port) {
  const { spawn } = require("child_process");
  const { wlog } = require("./layout");

  const mh = await spawn("mod-host", ["-n", `-p ${port}`]);

  modHost.PID = mh.pid;

  mh.stdout.on("data", (data) => {
    wlog(`[MH] ${data}`);
    if (data.includes("mod-host ready!")) {
      modHost.STATUS = modHostStatusEnum.StartedDisconnected;
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
 *
 */
async function connect() {
  const { wlog } = require("./layout");
  var elapsedTime = 0;

  var client = new net.Socket();
  // Try timeout times, wait 1 second between each try.
  while (
    modHost.STATUS !== modHostStatusEnum.StartedDisconnected &&
    elapsedTime <= settings.DEFAULT_TIMEOUT
  ) {
    await sleep(1000);
    elapsedTime += 1000;
  }

  client.connect({
    port: modHost.PORT,
    host: settings.MOD_HOST_SERVER,
  });

  //   client.setTimeout(5e3, () => client.destroy());

  client.once("connect", (data) => {
    wlog("[MH] Connected to mod-host.");
    modHost.STATUS = modHostStatusEnum.Connected;
    client.setTimeout(0);
  });

  client.on("data", function (data) {
    wlog("Received: " + data);
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

exports.connect = connect;
exports.init = init;
exports.destroy = destroy;
