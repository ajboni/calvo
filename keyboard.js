const Layout = require("./layout");
const App = require("./app");
const { wlog } = require("./layout");

function registerKeyboardShortcuts(screen, mainGrid) {
  screen.key(["escape", "q", "C-c"], function (ch, key) {
    App.exit();
  });

  screen.key(["tab"], function (ch, key) {
    Layout.focusNext();
  });

  screen.key(["S-tab"], function (ch, key) {
    Layout.focusPrev();
  });
}

exports.registerKeyboardShortcuts = registerKeyboardShortcuts;
