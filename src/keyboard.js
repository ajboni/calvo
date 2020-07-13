/**
 * Global Keyboard shortcuts
 * @module keyboard
 */

const Layout = require("./layout");
const App = require("./app");

/**
 * Register keyboard shorcuts for a screen
 *
 * @param {*} screen The blessed screen which will receive the shortcuts.
 * @param {*} mainGrid (not used)
 */
function registerKeyboardShortcuts(screen, mainGrid) {
  screen.key(["escape", "q", "C-c"], function (ch, key) {
    App.exit();
  });

  //   screen.key(["t"], function (ch, key) {
  //     queryTransport();
  //     //  wlog(jack.TRANSPORT_STATUS.usecs);
  //   });

  screen.key(["tab"], function (ch, key) {
    Layout.focusNext();
  });

  screen.key(["S-tab"], function (ch, key) {
    Layout.focusPrev();
  });
}

exports.registerKeyboardShortcuts = registerKeyboardShortcuts;
