var { removeNewLines } = require("./string_utils");
let { jack } = require("./store");

function init() {
  if (isJackServerRunning()) {
  } else {
    throw "JACK IS NOT RUNNING";
  }
}

function poll() {
  if (isJackServerRunning()) {
    updateStatus();
  } else {
    throw "JACK IS NOT RUNNING";
  }
}

function updateStatus() {
  jack.SAMPLE_RATE = getSampleRate();
  jack.JACK_STATUS = getJackStatus();
}

/**
 * Check whether or not the JACK server is running in the system. Uses jack_wait
 * @returns Returns True if JACK server is running.
 */
function isJackServerRunning() {
  const cp = require("child_process");
  const isJackRunning = cp.execSync("jack_wait --check", { encoding: "utf8" });
  return isJackRunning.startsWith("running");
}

/**
 * Get Jack Status as returned from jack_wait --check.
 * @returns Returns "Running" "Not Running"
 */
function getJackStatus() {
  const cp = require("child_process");
  const isJackRunning = cp.execSync("jack_wait --check", { encoding: "utf8" });
  return removeNewLines(isJackRunning) === "running"
    ? "Running"
    : "Not Running";
}

/**
 * Get sample rate of Jack Server. Uses jack_samplerate.
 * @returns JACK current sample rate.
 */
function getSampleRate() {
  const cp = require("child_process");
  let jack_samplerate = cp.execSync("jack_samplerate", { encoding: "utf8" });
  jack_samplerate = jack_samplerate.replace(/(\r\n|\n|\r)/gm, "");
  return jack_samplerate;
}

exports.isJackServerRunning = isJackServerRunning;
exports.init = init;
exports.poll = poll;
