const shell = require("shelljs");
const { wlog, wlogError } = require("./layout");
const { removeNewLines } = require("./string_utils");
const getPort = require("get-port");
const { settings } = require("./settings");
var net = require("net");

const modHostStatusEnum = Object.freeze({
  Stopped: "Stopped",
  StartedDisconnected: "Started (Disconnected)",
  Connected: "Connected",
});
let modHostProcess = {
  PID: 0,
  PORT: 0,
  FEEDBACK_PORT: 0,
  STATUS: modHostStatusEnum.Stopped,
};

// Exec mod-host, get the PID and the ephemeral ports.
async function init() {
  console.log("sss");
  const port = await getPort({
    port: getPort.makeRange(
      settings.MOD_HOST_PORT_START,
      settings.MOD_HOST_PORT_END
    ),
  });

  modHostProcess.PORT = port;
  modHostProcess.FEEDBACK_PORT = port + 1;

  // In the future we might want to start a docker container, or reach a host on the network.
  // For now we just spaqn a child process.
  await spawn(port);
  await connect();
}
function destroy() {
  shell.exec(`kill ${modHostProcess.PID}`);
}

// Spawn a mod-host process
async function spawn(port) {
  const { spawn } = require("child_process");
  const { wlog } = require("./layout");

  const mh = await spawn("mod-host", ["-n", `-p ${port}`]);

  modHostProcess.PID = mh.pid;

  mh.stdout.on("data", (data) => {
    wlog(`[MH] ${data}`);
    if (data.includes("mod-host ready!")) {
      modHostProcess.STATUS = modHostStatusEnum.StartedDisconnected;
    }
  });

  mh.stderr.on("data", (data) => {
    wlog(`[MH] *ERROR* ${data}`);
  });

  mh.on("close", (code) => {
    wlog(`[MH] Mod Host process exited with code ${code}`);
  });
}

async function connect() {
  const { wlog, wlogErrorkill } = require("./layout");
  var elapsedTime = 0;

  var client = new net.Socket();
  // Try timeout times, wait 1 second between each try.
  while (
    modHostProcess.STATUS !== modHostStatusEnum.StartedDisconnected &&
    elapsedTime <= settings.DEFAULT_TIMEOUT
  ) {
    await sleep(1000);
    elapsedTime += 1000;
  }
  //   ) {
  //     await sleep(1000);
  //     elapsedTime += 1000;
  //     await client.connect({
  //       port: modHostProcess.PORT,
  //       host: settings.MOD_HOST_SERVER,
  //     });
  //   }

  client.connect({
    port: modHostProcess.PORT,
    host: settings.MOD_HOST_SERVER,
  });

  //   client.setTimeout(5e3, () => client.destroy());

  client.once("connect", (data) => {
    wlog("[MH] Connected to mod-host.");
    modHostProcess.STATUS = modHostStatusEnum.Connected;
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.connect = connect;
exports.init = init;
exports.destroy = destroy;
exports.modHostProcess = modHostProcess;
