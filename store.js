const NodeCache = require("node-cache");
const fs = require("fs");
const path = require("path");

const modHostStatusEnum = Object.freeze({
  Stopped: "Stopped",
  StartedDisconnected: "Started (Disconnected)",
  Connected: "Connected",
});

const pluginsUriByName = new NodeCache();

const modHost = {
  PID: 0,
  PORT: 0,
  FEEDBACK_PORT: 0,
  STATUS: modHostStatusEnum.Stopped,
};

const jack = {
  DSP_LOAD: 0,
  SAMPLE_RATE: "-----",
  JACK_STATUS: "-----",
};

const saveCache = (cache, name, directoryPath = __dirname) => {
  console.log("Saving cache...");
  try {
    const keys = cache.keys();
    const cacheData = cache.mget(keys);
    const stringifiedData = JSON.stringify(cacheData);
    fs.writeFileSync(path.join(directoryPath, `${name}.json`), stringifiedData);
    console.log("Cache Saved.");
  } catch (error) {
    console.log(error);
  }
};

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

exports.pluginsUriByName = pluginsUriByName;
exports.jack = jack;
exports.modHost = modHost;
exports.modHostStatusEnum = modHostStatusEnum;
exports.saveCache = saveCache;
exports.loadCache = loadCache;
