const { settings } = require("../settings");
const { existsSync } = require("fs");
const store = require("./store");
const path = require("path");
const Layout = require("./layout");

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
    store.loadCache();
  } else {
    buildPluginCache();
  }

  store.setCategoryFilter("");
}

/**
 * Scans the system for installed plugins, and save a database in memory and disk.
 */
function buildPluginCache() {
  wlog("Building plugins cache, this might take a while, please wait...");
  try {
    //  const names = lv2ls(true);
    const plugins = grep();
    store.pluginCatalog.length = 0;
    store.pluginCatalog.push(...plugins);
    plugins.forEach((plugin, index) => {
      plugin.categories.forEach((cat) => {
        if (!store.pluginCategories.includes(cat)) {
          store.pluginCategories.push(cat);
        }
      });
    });
    store.saveCache();
  } catch (error) {
    Layout.wlog(error);
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
    Layout.wlog(error);
    return error;
  }
}

/**
 * Find a plugin by its name on the catalog.
 *
 * @param {*} pluginName The name to search for.
 */
function getPluginByName(pluginName) {
  const result = store.pluginCatalog.filter(
    (plugin) => plugin.name === pluginName
  );

  return result ? result[0] : null;
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
    Layout.wlogError(`Plugin ${uri} could not be loaded.`);
    throw error;
  }
}

exports.grep = grep;
exports.pluginInfo = pluginInfo;
exports.init = init;
exports.getPluginByName = getPluginByName;
