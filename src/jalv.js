const Layout = require("./layout");
const { spawn, exec, spawnSync } = require("child_process");

/**
 * Spawns a plugin. It will execute jalv and load the plugin. ALl communcations can be reachead via the process now at plugin.process
 *
 * @param {*} uri URI of the plugin to spawn.
 * @returns Returns the spawned process.
 */
function spawn_plugin(uri, rackIndex) {
  // We need to loose the buffer to get a fast response:
  // https://gitlab.com/drobilla/jalv/-/issues/7
  const process = spawn("stdbuf", [
    "-oL",
    "-eL",
    "jalv",
    "-d",
    "-p",
    "-t",
    uri,
  ]);
  process.stdout.setEncoding("utf8");
  process.stdin.setEncoding("utf8");
  process.stdout.on("data", function (msg) {
    Layout.wlog(`[#${rackIndex}] ${msg}`);
  });
  process.stderr.on("data", function (msg) {
    Layout.wlogError(`[#${rackIndex}] ${msg}`);
  });

  process.on("message", function (msg) {
    Layout.wlog(`[#${rackIndex}] ${msg}`);
  });
  return process;
}

/**
 * Kills the plugin's process
 *
 * @param {*} process
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
 * @param {*} process
 * @param {*} msg
 */
function write(process, msg) {
  process.stdin.write(msg + "\n");
}

exports.spawn_plugin = spawn_plugin;
exports.kill_plugin = kill_plugin;
exports.write = write;
