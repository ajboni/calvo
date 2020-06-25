const Layout = require("./layout");
const App = require("./app");
const { wlog } = require("./layout");
const { jack } = require("./store");
const { queryTransport } = require("./jack_client");

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
