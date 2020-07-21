/**
 * jalv is the underliying host powering calvo.
 * Each plugin is loaded on a new process and connected to previous/next plugins.
 * This module contains process spawn methods.
 * @module jalv
 */

const Layout = require("./layout");
const { spawn } = require("child_process");
const store = require("./store");
/**
 * Spawns a plugin. It will execute jalv and load the plugin. ALl communcations can be reachead via the process now at plugin.process
 *
 * @param {plugin} plugin
 * @param {*} rackIndex
 * @returns The nodejs child process.
 */
async function spawn_plugin(plugin, rackIndex) {
  const sleep = require("util").promisify(setTimeout);
  let processSpawned = false;
  // We need to loose the buffer to get a fast response:
  // https://gitlab.com/drobilla/jalv/-/issues/7
  const process = spawn("stdbuf", [
    "-oL",
    "-eL",
    "jalv",
    "-p",
    "-t",
    "-n",
    `calvo_${store.app.APP_ID}_${plugin.info.instanceNumber}_${plugin.info.safeName}`,
    plugin.uri,
  ]);
  process.stdout.setEncoding("utf8");
  process.stdin.setEncoding("utf8");
  process.stderr.once("data", function (msg) {
    processSpawned = true;
  });

  process.stdout.once("data", function (msg) {
    processSpawned = true;
  });
  //   process.stdout.on("data", function (msg) {
  //     Layout.wlog(`[#${rackIndex}] ${msg}`);
  //   });
  //   process.stderr.on("data", function (msg) {
  //     Layout.wlogError(`[#${rackIndex}] ${msg}`);
  //   });

  //   process.on("message", function (msg) {
  //     Layout.wlog(`[#${rackIndex}] ${msg}`);
  //   });

  let retries = 0;
  while (!processSpawned && retries < 5) {
    await sleep(200);
  }

  if (!processSpawned) {
    Layout.wlogError("Could not load plugin");
    return null;
  }
  return process;
}

/**
 * Gets the control values for a jalv process.
 *
 * @param {plugin} plugin Plugin instance (from rack)
 * @param {string} type Type of control to get('controls'|'monitor' )
 * @returns
 */
async function getControls(plugin, type) {
  const sleep = require("util").promisify(setTimeout);

  if (type === "controls") plugin.info.busy = true;
  if (type === "monitor" && plugin.info.busy === true) return;
  let done = false;
  let result = "";
  const process = plugin.process;

  write(plugin.process, type);
  process.stdout.once("data", function (msg) {
    result = msg;
    done = true;
  });

  let retries = 0;
  while (!done && retries < 5) {
    await sleep(200);
    retries++;
  }

  if (!done) {
    Layout.wlogError("Could not load plugin");
    return null;
  }

  //  Format result
  const resultJSON = jalvStdoutToJSON(result, type);
  plugin.info.busy = false;
  return resultJSON;
}

async function setControl(plugin, control, value) {
  const sleep = require("util").promisify(setTimeout);
  let done = false;
  let retries = 0;
  let result = "";

  write(plugin.process, `set ${control.symbol} ${value}`);
  plugin.process.stdout.once("data", function (msg) {
    result = msg;
    done = true;
  });

  while (!done && retries < 5) {
    retries++;
    await sleep(200);
  }

  if (!done) {
    Layout.wlogError(`Could set control ${control.symbol}`);
    return;
  }
  resultJSON = jalvStdoutToJSON(result, "set");
  return resultJSON;
}

/**
 * Formats and convert a JALV kvp stdout (CONTROL = VALUE) into a json object.
 *
 * @param {*} str JALV stoud to format
 * @param {*} command the command invoked which resulted in this output.
 * @returns
 */
function jalvStdoutToJSON(str, command) {
  const obj = { jalv_command: command };
  let result = str.replace(">", "").trim();
  result.split("\n").forEach((line) => {
    const kvp = line.split("=");
    const k = kvp[0].toString().trim();
    const v = kvp[1];
    obj[k] = v;
  });
  return obj;
}

/**
 * Kills the plugin process.
 *
 * @param {*} process
 * @param {*} rackIndex
 */
function kill_plugin(process, rackIndex) {
  try {
    process.kill();
  } catch (error) {
    Layout.wlogError(`[#${rackIndex}] ${error}`);
  }
}

/**
 * Writes a message to a plugin process.
 * @param {jalv process} process The jalv process to write into. (plugin.process)
 * @param {string} msg The Jalv prompt supports several commands for interactive control.
 * @example <caption>JALV Commands</caption>
 *       help              Display help message
 *       controls          Print settable control values
 *       monitors          Print output control values
 *       presets           Print available presets
 *       preset URI        Set preset
 *       set INDEX VALUE   Set control value by port index
 *       set SYMBOL VALUE  Set control value by symbol
 *       SYMBOL = VALUE    Set control value by symbol
 */
function write(process, msg) {
  process.stdin.write(msg + "\n");
}

exports.spawn_plugin = spawn_plugin;
exports.kill_plugin = kill_plugin;
exports.write = write;
exports.getControls = getControls;
exports.setControl = setControl;
