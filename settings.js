const settings = {
  UI_UPDATE_RATE: 1000, // Time in ms in which the UI refresh
  JACK_POLLING_RATE: 5000, // Time in ms in which we query JACK server for statistics.
  MOD_HOST_PORT_START: 12200, // Start of range Port to start assigning  to ModHost
  MOD_HOST_PORT_END: 12500, // End of port range
  MOD_HOST_SERVER: "localhost", // For future network based hosts
  DEFAULT_TIMEOUT: 10000, // Max ms to wait for connection/initial setup
  LV2_PLUGINS_FOLDERl: "/user/lib/lv2",
  SCAN_PLUGINS: false, // If false, it will not scan for plugins on startup (use with caution).
};

exports.settings = settings;
