var shell = require("shelljs");
var { removeNewLines } = require("./string_utils");

const status = {
  DSP_LOAD: 0,
  SAMPLE_RATE: "-----",
  JACK_STATUS: "-----",
};

function init() {
  if (isJackServerRunning()) {
  } else {
    throw "JACK IS NOT RUNNING";
  }
}

function poll() {
  if (isJackServerRunning()) {
    getSampleRate();
  } else {
    throw "JACK IS NOT RUNNING";
  }
}

function isJackServerRunning() {
  const isJackRunning = shell.exec("jack_wait --check", { silent: true });
  status.JACK_STATUS = removeNewLines(isJackRunning.stdout);
  return isJackRunning.stdout.startsWith("running");
}

// Start Polling CPU usage.
function startPollingCpuLoad() {
  const cpuLoad = shell.exec("jack_cpu_load", { silent: true });
  cpuLoad.stdout.on("data", function (data) {
    status.DSP_LOAD = data;
  });
}

// Start Polling CPU usage.
function getSampleRate() {
  const jack_samplerate = shell.exec(
    "jack_samplerate",
    { silent: true },
    (code, stdout, stderr) => {
      status.SAMPLE_RATE = stdout.replace(/(\r\n|\n|\r)/gm, "");
    }
  );
}

exports.isJackServerRunning = isJackServerRunning;
exports.startPollingCpuLoad = startPollingCpuLoad;
exports.status = status;
exports.init = init;
exports.poll = poll;
