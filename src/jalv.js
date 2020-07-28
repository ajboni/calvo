/**
 * jalv is the underliying host powering calvo.
 * Each plugin is loaded on a new process and connected to previous/next plugins.
 * This module contains process spawn methods.
 * @module jalv
 */

const Layout = require("./layout");
const { spawn } = require("child_process");
const store = require("./store");
const PubSub = require("pubsub-js");
const { settings } = require("../settings");

// Each time a new plugin is seclected query jalv for controls info.
PubSub.subscribe("selectedPlugin", (msg, plugin) => {
  addToQueue(plugin, "controls", "controls");
});

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
  //   const process = spawn("stdbuf", [
  //     "-oL",
  //     "-eL",
  //     "jalv",
  //     "-p",
  //     "-t",
  //     "-n",
  //     `calvo_${store.app.APP_ID}_${plugin.info.instanceNumber}_${plugin.info.safeName}`,
  //     plugin.uri,
  //   ]);
  const process = spawn("script", [
    "-q",
    "-c",
    `jalv -p -t -n calvo_${store.app.APP_ID}_${plugin.info.instanceNumber}_${plugin.info.safeName} ${plugin.uri}`,
    "/dev/null",
  ]);

  //   const process = spawn("unbuffer", [
  //     "jalv",
  //     "-p",
  //     "-t",
  //     "-n",
  //     `calvo_${store.app.APP_ID}_${plugin.info.instanceNumber}_${plugin.info.safeName}`,
  //     plugin.uri,
  //   ]);

  process.stdout.setEncoding("utf8");
  process.stdin.setEncoding("utf8");

  process.stderr.once("data", function (msg) {
    processSpawned = true;
  });

  process.stdout.once("data", function (msg) {
    processSpawned = true;
  });
  //   process.stdout.on("data", function (msg) {
  //     store.wlog(`[#${rackIndex}] ${msg}`);
  //   });

  //   process.stderr.on("data", function (msg) {
  //     store.wlogError(`[#${rackIndex}] ${msg}`);
  //   });

  //   process.on("message", function (msg) {
  //     store.wlog(`[#${rackIndex}] ${msg}`);
  //   });

  let retries = 0;
  while (!processSpawned && retries < 5) {
    await sleep(100);
  }

  if (!processSpawned) {
    store.wlogError("Could not load plugin");
    return null;
  }

  plugin.info.queue = {
    set: [],
    controls: [],
  };

  plugin.process = process;
  plugin.info.processQueueInterval = setInterval(
    () => processQueue(plugin),
    settings.JALV_POLLING_RATE
  );
  return process;
}

/**
 * Gets the control values for a jalv process.
 *
 * @param {plugin} plugin Plugin instance (from rack)
 * @param {string} type Type of control to get('controls'|'monitor' )
 * @returns the control value as json: ctrlName: ctrlValue
 */
async function getControls(plugin, type) {
  addToQueue(plugin, type, type);
}

/**
 * On calvo, Jalv host is spawned as a child process and we take the values from stdout.
 * To provide at least, a very basic monitoring, a queue system is necesary.
 * The queue will 'tick' every x ms according to JALV_POLLING_RATE setting. each tick will process a command and wait for the response.
 * Different commands have different priorities:
 * SET = HIGH, controls = MID, monitors = LOW
 * As monitors spams the stdout buffer it was neeeded to only call it when nothing else is needing the buffer.
 * @see settings
 *
 * @param {plugin} plugin
 * @returns null if no Selected plugin or the process is busy (wating for a response)
 */
async function processQueue(plugin) {
  // If this plugin is not the selected. Do not do anything.
  if (store.getSelectedPlugin() !== plugin) return;
  if (!plugin) return;

  // If still we havent got a stdout from last command, skip this tick.
  if (plugin.process.busy) return;

  // Top priority for SET commands
  if (plugin.info.queue.set.length > 0) {
    const result = await writeWait(plugin.process, plugin.info.queue.set[0]);
    plugin.info.queue.set.shift();
    store.wlogDebug(JSON.stringify(result));
    // Mid priority for GET controls
  } else if (plugin.info.queue.controls.length > 0) {
    const result = await writeWait(plugin.process, "controls");
    plugin.info.queue.controls.shift();
    plugin.info.controls = result;
    store.wlogDebug(JSON.stringify(result));
    store.notifySubscribers("pluginControlsChanged", plugin);
  } else {
    // At last, if nothing else is printing output, we can now get some monitor info.
    if (settings.JALV_MONITORING && plugin.ports.control.output.length > 0) {
      const result = await writeWait(plugin.process, "monitors");
      // Sometimes we cannot get info and we get corrupted result, lets use the previous value for now.
      if (result) {
        plugin.info.monitors = result;
        store.notifySubscribers("pluginMonitorsChanged", plugin);
      }
    }
  }
}

/**
 * Write to a process stdin and wait for a response on stdout.
 * While waiting, it will set the process.busy flag, so the queue will not advance until this function is finished.
 * *
 * @param {pluginJalvProcess} process The plugin instance JALV process.
 * @param {string} command The command to execute on JALV
 * @param {number} [maxRetries=10] How many time retry before giving up.
 * @param {number} [retriesWait=5] How many ms to wait before each retry.
 * @returns A JSON file with the (parsed) output for the given command.
 */
async function writeWait(process, command, maxRetries = 40, retriesWait = 5) {
  const sleep = require("util").promisify(setTimeout);
  process.busy = true;

  let done = false;
  let retries = 0;
  let result = "";

  process.stdin.write(command + "\n");

  process.stdout.on("data", function (msg) {
    result += msg;
    done = true;
  });

  while (!done && retries < maxRetries) {
    retries++;
    await sleep(retriesWait);
  }

  if (!done) {
    store.wlogError("Error in write wait, for " + command);
    process.busy = false;
    process.stdout.removeAllListeners(["data"]);
    return null;
  }

  // TODO: Recheck this. 'Once' event is giving truncated output
  process.stdout.removeAllListeners(["data"]);
  resultJSON = jalvStdoutToJSON(result, command);
  process.busy = false;
  return resultJSON;
}

/**
 * Add a command to the plugin instance queue
 *
 * @param {plugin} plugin The plugin instance.
 * @param {string} type Can be 'set, controls, monitors'
 * @param {string} command command to execute.
 * @returns null if no plugin is specified
 */
function addToQueue(plugin, type, command) {
  if (!plugin) return;
  plugin.info.queue[type].push(command);
}

/**
 * Set a value on a control  (in queue)
 *
 * @param {plugin} plugin Plugin
 * @param {string} control Control name. Uses `symbol` property of LV2 spec.
 * @param {number} value Value to assign.
 * @returns null if no plugin is specified
 */
function setControl(plugin, control, value) {
  if (!plugin) return;
  const command = `set ${control.symbol} ${value}`;
  addToQueue(plugin, "set", command);
}

/**
 * Set a preset on a plugin process (add to queue)
 *
 * @param {plugin} plugin Plugin instance
 * @param {number} index of preset as appears on the widget
 * @returns null if fails.
 */
function setPreset(plugin, index) {
  if (!plugin) return;
  if (!plugin.presets[index]) return;

  const uri = plugin.presets[index].uri;

  if (!uri) {
    store.wlogError(`No preset ${index} found`);
    return;
  }
  const command = `preset ${uri}`;
  addToQueue(plugin, "set", command);
}

/**
 * Formats and convert a JALV kvp stdout (CONTROL = VALUE) into a json object.
 *
 * @param {string} str JALV stoud to format
 * @param {string} command the command invoked which resulted in this output.
 * @returns a JSON object. key: value
 */
function jalvStdoutToJSON(str, command) {
  const obj = { jalv_command: command };
  let result = str.replace(">", "").trim();
  result.split(/\r?\n/).forEach((line, index) => {
    if (index === 0) {
      return;
    }

    const kvp = line.split("=");
    const k = kvp[0].toString().replace(">", "").trim();
    const v = kvp[1].replace(">", "");
    obj[k] = v;
  });
  return obj;
}

/**
 * Kills the plugin process.
 *
 * @param {pluginProcess} process
 * @param {number} rackIndex
 */
function kill_plugin(plugin, rackIndex) {
  try {
    clearInterval(plugin.info.processQueueInterval);
    plugin.process.kill();
  } catch (error) {
    store.wlogError(`[#${rackIndex}] ${error}`);
  }
}

/**
 * Writes a message to a plugin process.
 * @param {jalvProcess} process The jalv process to write into. (plugin.process)
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
