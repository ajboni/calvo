const NodeCache = require("node-cache");
const fs = require("fs");
const path = require("path");
const Layout = require("./layout");

const modHostStatusEnum = Object.freeze({
  Stopped: "Stopped",
  StartedDisconnected: "Started (Disconnected)",
  Connected: "Connected",
});

const pluginsCatalog = new NodeCache();

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

function saveCache(cache, name, directoryPath = __dirname) {
  Layout.wlog("Saving cache...");
  try {
    const keys = cache.keys();
    const cacheData = cache.mget(keys);
    const stringifiedData = JSON.stringify(cacheData);
    fs.writeFileSync(path.join(directoryPath, `${name}.json`), stringifiedData);
    Layout.wlog("Cache Saved.");
  } catch (error) {
    Layout.wlog(error);
  }
}

const loadCache = (cache, name, directoryPath = __dirname) => {
  const filePath = path.join(directoryPath, `${name}.json`);
  if (fs.existsSync(filePath)) {
    const jsonData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(jsonData);
    for (const [key, val] of Object.entries(data)) {
      if (data.hasOwnProperty(key)) {
        cache.set(key, val);
      }
    }
  }
};

exports.pluginsCatalog = pluginsCatalog;
exports.jack = jack;
exports.modHost = modHost;
exports.modHostStatusEnum = modHostStatusEnum;
exports.saveCache = saveCache;
exports.loadCache = loadCache;
exports.app = app;
