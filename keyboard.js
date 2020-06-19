const Layout = require("./layout");

function registerKeyboardShortcuts(screen, mainGrid) {
  screen.key(["escape", "q", "C-c"], function (ch, key) {
    return process.exit(0);
  });

  screen.key(["tab"], function (ch, key) {
    Layout.focusNext();
  });

  screen.key(["S-tab"], function (ch, key) {
    Layout.focusPrev();
  });
}

exports.registerKeyboardShortcuts = registerKeyboardShortcuts;
