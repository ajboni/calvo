/**
 * jalv is the underliying host powering calvo.
 * Each plugin is loaded on a new process and connected to previous/next plugins.
 * This module contains process spawn methods.
 * @module jalv
 */

const Layout = require("./layout");
const { spawn, exec, spawnSync } = require("child_process");
const { writeFile } = require("fs");

/**
 * Spawns a plugin. It will execute jalv and load the plugin. ALl communcations can be reachead via the process now at plugin.process
 *
 * @param {*} uri
 * @param {*} rackIndex
 * @returns The nodejs child process.
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
 * @param {*} process The jalv process to write into.
 * @param {*} msg The Jalv prompt supports several commands for interactive control.
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
