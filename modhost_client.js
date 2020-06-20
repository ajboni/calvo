const shell = require("shelljs");
const { wlog } = require("./layout");
const { removeNewLines } = require("./string_utils");
const getPort = require("get-port");
const { settings } = require("./settings");
let modHostProcess = {
  PID: 0,
  PORT: 0,
  FEEDBACK_PORT: 0,
};

// Exec mod-host, get the PID and the ephemeral ports.
function init() {
  getPort({
    port: getPort.makeRange(
      settings.MOD_HOST_PORT_START,
      settings.MOD_HOST_PORT_END
    ),
  }).then((port) => {
    modHostProcess.PORT = port;
    modHostProcess.FEEDBACK_PORT = port + 1;
    connect(port);
  });
}
function destroy() {
  shell.exec(`kill ${modHostProcess.PID}`);
}

function connect(port) {
  const { spawn } = require("child_process");
  const mh = spawn("mod-host", ["-n", `-p ${port}`, `-f ${port + 1}`]);

  modHostProcess.PID = mh.pid;

  mh.stdout.on("data", (data) => {
    const { wlog } = require("./layout");
    wlog(`[MOD-HOST]: ${data}`);
  });

  mh.stderr.on("data", (data) => {
    wlog(`[MOD-HOST]: *ERROR* ${data}`);
  });

  mh.on("close", (code) => {
    wlog(`Mod Host process exited with code ${code}`);
  });

  //   const modHost = shell.exec(
  //     "mod-host -p 0 | grep -o '[0-9]*' -m 1",
  //     {
  //       silent: true,
  //       async: true,
  //     },
  //     function (code, stdout, stderr) {
  //       console.log("ssss");
  //     }
  //   );

  //   modHost.stderr.on("error", (err) => {});
  //   modHost.stdout.on("data", (data) => {
  //     data = removeNewLines(data);
  //     modHostProcess.PID = data;
  //     console.log(data);
  //   });

  //   modHost.stdout.on("end", () => {
  //     //  const portQuery = `netstat -ano -p tcp | grep ${modHostProcess.PID}`;
  //     const portQuery = `netstat -ano -p tcp | grep tcp`;
  //     const modHostPort = shell.exec(portQuery, {
  //       async: true,
  //     });
  //     modHostPort.stdout.on("data", (data) => {
  //       modHostProcess.PORT = data;
  //     });
  //   });
}

exports.connect = connect;
exports.init = init;
exports.destroy = destroy;
exports.modHostProcess = modHostProcess;
