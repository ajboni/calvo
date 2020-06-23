const { tabbedTreeToJSON, stringToTrimmedArray } = require("./string_utils");
const { wlogError, wlog } = require("./layout");
const { pluginsUriByName, saveCache, loadCache } = require("./store");
const { settings } = require("./settings");

/**
 * Initialize: Scan for plugins and setup store (cache)
 *
 */
function init() {
  if (!settings.SCAN_PLUGINS) {
    console.log("Loading plugins cache...");
    loadCache(pluginsUriByName, "pluginsUriByName");
    return;
  }

  console.log("Building plugins cache, please wait...");
  try {
    const names = lv2ls(true);
    const uris = lv2ls(false);
    names.forEach((name, index) => {
      pluginsUriByName.set(name, uris[index]);
    });
    saveCache(pluginsUriByName, "pluginsUriByName");
  } catch (error) {
    wlog(error);
  }
}

/**
 * Gets all plugins Names AND Uris
 *
 * @returns An array of objects with name, uris as properties.
 */
function listAllPlugins() {
  let arr = [];
  try {
    const names = lv2ls(true);
    const uris = lv2ls(false);

    names.forEach((name, index) => {
      let obj = {};
      obj.name = name;
      obj.uri = uris[index];
      arr.push(obj);
    });
    return arr;
  } catch (error) {
    wlog(error);
    return error;
  }
}

/**
 * List all lv2 plugins available on the system.
 * @param {boolean} [names=false] Show names instead of URIS
 * @returns Returns an array with all plugins URIs/Names available on the system
 */
function lv2ls(names = false) {
  const cp = require("child_process");
  const param = names ? "-n" : "";
  try {
    const result = cp.execSync(`lv2ls ${param}`, { encoding: "utf8" });
    return stringToTrimmedArray(result);
  } catch (error) {
    wlog(error);
    return error;
  }
}

/**
 * Grep LV2 plugin by uris, filtered by regex.
 *
 * @param {string} [regex="."] Regex to query plugins. By default it will return all plugins available.
 * @returns Returns an array with the plugins found filtered by the regex.
 */
function grep(regex = ".") {
  const cp = require("child_process");
  try {
    const result = cp.execSync(
      `python3 -m jackaudiotools.lv2.lv2_grep ${regex}`,
      {
        cwd: "./py",
        encoding: "utf8",
      }
    );
    return stringToTrimmedArray(result);
  } catch (error) {
    wlog(error);
    return error;
  }
}

/**
 * Get detailed information about a plugin.
 * @param {*} uri URI of the plugin.
 * @returns Returns a JSON object with the plugin's LV2 properties.
 */
function pluginInfo(uri) {
  const cp = require("child_process");

  try {
    const result = cp.execSync(
      `python3 -m jackaudiotools.lv2.plugin_info ${uri}`,
      {
        cwd: "./py",
        encoding: "utf8",
      }
    );
    return JSON.parse(result);
  } catch (error) {
    wlogError(`Plugin ${uri} could not be loaded.`);
    return error;
  }
}

exports.lv2ls = lv2ls;
exports.grep = grep;
exports.pluginInfo = pluginInfo;
exports.listAllPlugins = listAllPlugins;
exports.init = init;
