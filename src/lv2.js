const { tabbedTreeToJSON, stringToTrimmedArray } = require("./string_utils");
const { wlogError, wlog } = require("./layout");
const {
  pluginCatalog,
  saveCache,
  loadCache,
  pluginCategories,
  setCategoryFilter,
  filteredPluginCatalog,
} = require("./store");
const { settings } = require("../settings");
const { existsSync } = require("fs");
const path = require("path");

/**
 * Initialize: Scan for plugins and setup store (cache)
 *
 */
function init() {
  if (
    existsSync(path.join(__dirname, "pluginCatalog.json")) &&
    !settings.SCAN_PLUGINS
  ) {
    console.log("Loading plugins cache...");
    loadCache();
  } else {
    buildPluginCache();
  }

  setCategoryFilter("");
}

/**
 * Scans the system for installed plugins, and save a database in memory and disk.
 */
function buildPluginCache() {
  const { wlogError, wlog } = require("./layout");

  wlog("Building plugins cache, this might take a while, please wait...");
  try {
    //  const names = lv2ls(true);
    const plugins = grep();
    pluginCatalog.length = 0;
    pluginCatalog.push(...plugins);
    plugins.forEach((plugin, index) => {
      plugin.categories.forEach((cat) => {
        if (!pluginCategories.includes(cat)) {
          pluginCategories.push(cat);
        }
      });
    });
    saveCache();
  } catch (error) {
    wlog(error);
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
      `python3 ./py/jack-audio-tools/lv2/grep.py -c --json ${regex}`,
      {
        encoding: "utf8",
      }
    );
    return JSON.parse(result);
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

exports.grep = grep;
exports.pluginInfo = pluginInfo;
exports.init = init;
