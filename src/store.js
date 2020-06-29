const fs = require("fs");
const path = require("path");
const Layout = require("./layout");
const Lv2 = require("./lv2");
const PluginListWidget = require("./widgets/pluginList");
const PluginInfoWidget = require("./widgets/pluginInfo");
const RackWidget = require("./widgets/rack");
const ModHostClient = require("./modhost_client");
const { getPluginByName, pluginInfo } = require("./lv2");

const modHostStatusEnum = Object.freeze({
  Stopped: "Stopped",
  StartedDisconnected: "Disconnected",
  Connected: "Connected",
});

const pluginCatalog = [];
const filteredPluginCatalog = [];
const pluginCategories = ["(All)"];
const rack = [];
var selectedPlugin = {};
let instanceNumber = 0;

function addPluginToRack(pluginName) {
  try {
    const p = Lv2.getPluginByName(pluginName);
    const plugin = pluginInfo(p.uri);
    ModHostClient.addPlugin(p.uri, instanceNumber);
    plugin.info = {
      instanceNumber: instanceNumber,
      bypass: false,
    };

    // TODO: Connect to previous, disconnect previous from master.
    instanceNumber++;
    rack.push(plugin);
    RackWidget.update();
    Layout.wlog(`Added ${plugin.name} to rack. (#${rack.length - 1})`);
  } catch (error) {
    Layout.wlogError(`Error adding plugin to rack: ${error}`);
  }
}

/**
 * Removes a plugin according to the index on the rack.
 *
 * @param {*} index Rack Index
 */
function removePluginAt(index) {
  const plugin = rack[index];
  rack.splice(index, 1);
  Layout.wlog(`Remove plugin #${index} - ${plugin.name}`);
  ModHostClient.removePlugin(plugin.info.instanceNumber);
  RackWidget.update();
  // TODO: Disconnect.
}

/**
 * Sets the plugin that will be focused to edit.
 *
 * @param {*} pluginName
 */
function setSelectedPluginIndex(pluginName) {}

const app = {
  INITIALIZED: false,
};

const modHost = {
  PID: 0,
  PORT: 0,
  FEEDBACK_PORT: 0,
  STATUS: modHostStatusEnum.Stopped,
};

const jack = {
  JACK_STATUS: {
    status: "---",
    cpu_load: 0,
    block_size: 0,
    realtime: true,
    sample_rate: 0,
  },
  TRANSPORT_STATUS: {
    state: "stopped",
    cpu_load: 1.2,
    bar: 5,
    bar_start_tick: 30720.0,
    beat: 4,
    beat_type: 4.0,
    beats_per_bar: 4.0,
    beats_per_minute: 120.0,
    frame: 430592,
    frame_rate: 44,
    tick: 1014,
    ticks_per_beat: 1920.0,
    usecs: 15881132220,
  },
};

function setCategoryFilter(filter = "") {
  if (pluginCategories.includes(filter) && filter !== "(All)") {
    filteredPluginCatalog.length = 0;
    const filteredData = pluginCatalog.filter((plugin) =>
      plugin.categories.includes(filter)
    );
    filteredPluginCatalog.length = 0;
    filteredPluginCatalog.push(...filteredData);
    Layout.renderScreen();
  } else {
    filteredPluginCatalog.length = 0;
    filteredPluginCatalog.push(...pluginCatalog);
    Layout.renderScreen();
  }

  if (app.INITIALIZED) {
    PluginListWidget.update();
  }
}

function saveCache(directoryPath = __dirname) {
  Layout.wlog("Saving cache...");
  try {
    if (fs.existsSync(path.join(directoryPath, `pluginCatalog.json`))) {
      fs.unlinkSync(path.join(directoryPath, `pluginCatalog.json`));
    }
    if (fs.existsSync(path.join(directoryPath, `pluginCatalog.json`))) {
      fs.unlinkSync(path.join(directoryPath, `pluginCategories.json`));
    }

    const stringifiedData = JSON.stringify(pluginCatalog);
    fs.writeFileSync(
      path.join(directoryPath, `pluginCatalog.json`),
      stringifiedData
    );
    const categories = ["(All)"];
    pluginCatalog.map((item) => {
      const cats = item.categories;
      cats.forEach((cat) => {
        if (!categories.includes(cat)) {
          categories.push(cat);
        }
      });
    });

    pluginCategories.length = 0;
    pluginCategories.push(...categories);

    fs.writeFileSync(
      path.join(directoryPath, `pluginCategories.json`),
      JSON.stringify(categories.sort())
    );

    Layout.wlog("Cache Saved.");
  } catch (error) {
    Layout.wlog(error);
  }
}

function loadCache(directoryPath = __dirname) {
  const filePath = path.join(directoryPath, `pluginCatalog.json`);
  if (fs.existsSync(filePath)) {
    const jsonData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(jsonData);
    pluginCatalog.length = 0;
    pluginCatalog.push(...data);
  }

  const catPath = path.join(directoryPath, `pluginCategories.json`);
  if (fs.existsSync(catPath)) {
    const catData = fs.readFileSync(catPath, "utf8");
    pluginCategories.length = 0;
    pluginCategories.push(...JSON.parse(catData));
  }
}

exports.pluginCatalog = pluginCatalog;
exports.pluginCategories = pluginCategories;
exports.jack = jack;
exports.modHost = modHost;
exports.modHostStatusEnum = modHostStatusEnum;
exports.saveCache = saveCache;
exports.loadCache = loadCache;
exports.app = app;
exports.setCategoryFilter = setCategoryFilter;
exports.filteredPluginCatalog = filteredPluginCatalog;
exports.setSelectedPluginIndex = setSelectedPluginIndex;
exports.addPluginToRack = addPluginToRack;
exports.rack = rack;
exports.removePluginAt = removePluginAt;
