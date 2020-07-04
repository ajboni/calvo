const fs = require("fs");
const path = require("path");
const Layout = require("./layout");
const Lv2 = require("./lv2");
const PluginListWidget = require("./widgets/pluginList");
const PluginInfoWidget = require("./widgets/pluginInfo");
const RackWidget = require("./widgets/rack");
const ModHostClient = require("./modhost_client");
const { getPluginByName, pluginInfo } = require("./lv2");
const PubSub = require("pubsub-js");
const { settings } = require("../settings");

const modHostStatusEnum = Object.freeze({
  Stopped: "Stopped",
  StartedDisconnected: "Disconnected",
  Connected: "Connected",
});

function notifySubscribers(topic, data) {
  PubSub.publish(topic, data);
}

const app = {
  INITIALIZED: false,
  CURRENT_PAGE: 0,
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
  PORTS: {
    all: [],
    audio: {
      playback: [],
      capture: [],
    },
    midi: {
      playback: [],
      capture: [],
    },
  },
  CONNECTIONS: {
    inputMode: settings.DEFAULT_INPUT_MODE,
    inputLeft: settings.DEFAULT_INPUT_L,
    inputRight: settings.DEFAULT_INPUT_R,
    outputMode: settings.DEFAULT_OUTPUT_MODE,
    outputLeft: settings.DEFAULT_OUTPUT_L,
    outputRight: settings.DEFAULT_OUTPUT_R,
  },
};

/**
 * Sets the current Carrousel Page
 *
 */
function setCurrentPage(pageNumber) {
  app.CURRENT_PAGE = pageNumber;
  notifySubscribers("app", app);
}

function setJackStatus(
  jackStatus = jack.JACK_STATUS,
  transport_status = jack.TRANSPORT_STATUS,
  ports = jack.PORTS,
  connections = jack.CONNECTIONS
) {
  jack.JACK_STATUS = jackStatus;
  jack.TRANSPORT_STATUS = transport_status;
  jack.PORTS = ports;
  jack.CONNECTIONS = connections;
  notifySubscribers("jack", jack);
}

/**
 * Disconnects and reconnects every plugin;
 *
 */
function reconectAll() {
  disconnectAll();
  connectAll();
}

/**
 * Disconnects all plugin outputs
 *
 */
function disconnectAll() {}

/**
 * Process connections for each plugin.
 *
 */
function connectAll() {}

/**
 * Sets an audio source for a specific channel. It will trigger a total reconnection.
 *
 * @param {*} mode Mode should be input or output
 * @param {*} channel 'left' or 'right'
 * @param {*} name The name of the jack audio source.
 */
function setAudioSource(mode, channel, name) {
  if (mode === "input") {
    if (channel === "left") jack.CONNECTIONS.inputLeft = name;
    if (channel === "right") jack.CONNECTIONS.inputRight = name;
  }

  if (mode === "output") {
    if (channel === "left") jack.CONNECTIONS.output = name;
    if (channel === "right") jack.CONNECTIONS.inputRight = name;
  }
  notifySubscribers("jack", jack);
  Layout.wlog(jack.CONNECTIONS.inputLeft);
  Layout.wlog(jack.CONNECTIONS.inputRight);
}

/**
 * Set Input/Output mode to mono or stereo.
 * This will trigger a complete reconnection of all plugins
 *
 * @param {*} direction 'input | output
 * @param {*} mode mono | stereo
 */
function setAudioSourceMode(direction, mode) {
  jack.CONNECTIONS[direction + "Mode"] = mode;
  notifySubscribers("jack", jack);

  // TODO: RESET CONNECTIONS
}

/**
 *
 * @returns Returns JACK state
 */
function getJackStatus() {
  return jack;
}

const pluginCatalog = [];
const filteredPluginCatalog = [];
const pluginCategories = ["(All)"];
const rack = [];
let selectedPlugin = {};
let instanceNumber = 0;

function getSelectedPlugin() {
  return selectedPlugin;
}

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
    notifySubscribers("rack", rack);
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
  if (selectedPlugin.uri === plugin.uri) {
    selectedPlugin = null;
    notifySubscribers("selectedPlugin", selectedPlugin);
  }
  notifySubscribers("rack", rack);

  // TODO: Disconnect.
}

/**
 * Sets the plugin that will be focused to edit.
 *
 * @param {*} pluginName
 */
function setSelectedPluginIndex(pluginName, index) {
  selectedPlugin = rack[index];
  notifySubscribers("selectedPlugin", selectedPlugin);
}

/**
 * This function will process
 *
 */
function processConnections() {}

/**
 * This function will force connection between 2 plugins. If one of them is mono, adjust as necesary
 *
 * @param {*} src
 * @param {*} dst
 */
function connectPlugins(src, dst) {}

/**
 * Connect ONLY last plugin to master output(s). If one of them is mono, adjust as necesary.
 *
 */
function connectLastToMasterOutputs() {}

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
    notifySubscribers("filteredPluginCatalog", filteredPluginCatalog);
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
exports.setJackStatus = setJackStatus;
exports.getJackStatus = getJackStatus;
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
exports.getSelectedPlugin = getSelectedPlugin;
exports.notifySubscribers = notifySubscribers;
exports.setCurrentPage = setCurrentPage;
exports.setAudioSource = setAudioSource;
exports.setAudioSourceMode = setAudioSourceMode;
