const contrib = require("blessed-contrib");
const PubSub = require("pubsub-js");
const fs = require("fs");
const { tree } = require("blessed-contrib");

const HelpWidget = function (grid, x, y, xSpan, ySpan) {
  const helpWidget = grid.set(y, x, ySpan, xSpan, contrib.markdown, {
    label: " Calvo Help ",
    tags: true,
    input: false,
    mouse: true,
    interactive: true,
    keys: false,
    padding: { left: 1, right: 1, top: 1, bottom: 1 },
    style: {
      border: { fg: "#7ea87f" },
      focus: {
        border: { fg: "red" },
        //   enabled: false,
      },
    },
  });

  const help = fs.readFileSync("HELP.md", { encoding: "utf8" });
  helpWidget.setMarkdown(help);
  return helpWidget;
};

module.exports = HelpWidget;
