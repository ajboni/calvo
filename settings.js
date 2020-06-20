const settings = {
  UI_UPDATE_RATE: 1000, // Time in ms in which the UI refresh
  JACK_POLLING_RATE: 1000, // Time in ms in which we query JACK server for statistics.
  MOD_HOST_PORT_START: 12200, // Start of range Port to start assigning  to ModHost
  MOD_HOST_PORT_END: 12500, // End of port range
};

exports.settings = settings;
