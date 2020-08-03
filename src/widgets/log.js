const blessed = require("blessed");
const PubSub = require("pubsub-js");
var log = {};

function make(grid, x, y, xSpan, ySpan) {
  log = grid.set(y, x, ySpan, xSpan, blessed.log, {
    tags: true,
    label: "Logs",
    input: false,
    mouse: true,
    interactive: true,
    keys: false,
    style: {
      border: { fg: "#7ea87f" },
      focus: {
        border: { fg: "red" },
        //   enabled: false,
      },
    },
  });

  //   log.on("click", function (data) {
  //     screen.copyToClipboard("ssss");
  //     wlog("Log copied to clipboard.");
  //   });
  var token = PubSub.subscribe("wlog", update);
  var token = PubSub.subscribe("wlogError", update);
  var token = PubSub.subscribe("wlogDebug", update);
  var token = PubSub.subscribe("wlogDebugWarning", update);

  return log;
}

/**
 * Fired whenever a new log message arrives
 *
 * @param {string} type Type of messsage (wlog, wlogError, wlogDebug)
 * @param {string} content Message to loh
 */
function update(type, content) {
  let color = "";
  if (type === "wlogError") {
    color = "{red-fg}";
  } else if (type === "wlogDebug") {
    color = "{green-fg}";
  } else if (type === "wlogDebugWarning") {
    color = "{yellow-fg}";
  } else {
    color = "{white-fg}";
  }

  log.log(`${color} ${content}`);
}

exports.make = make;
exports.update = update;
