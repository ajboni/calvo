/**
 * User configurable settings to alter how the app works.
 * @module settings
 */

/**  @enum  */
const settings = {
  /** @type {number} Time in ms in which the UI refresh */
  UI_UPDATE_RATE: 100,
  /** @type {number}Time in ms in which we query JACK server for statistics. */
  JACK_POLLING_RATE: 10000,
  /** @type {string} Location where to scan folders. */
  LV2_PLUGINS_FOLDER: "/user/lib/lv2",
  /** @type {boolean} If false, it will not scan for plugins on startup (use with caution). */
  SCAN_PLUGINS: false,
  /** @type {number} Ammount to scroll when using page up or page dow keys. */
  SCROLL_AMMOUNT: 10,
  /** @type {"mono"|"stereo"} Define what the default input mode will be.*/
  DEFAULT_INPUT_MODE: "mono",
  /** @type {string} Define what the default left input port mode will be. (jack port name: ex: system:capture_1*/
  DEFAULT_INPUT_L: "PulseAudio JACK Sink:front-left",
  /** @type {string} Define what the default right input port mode will be. (jack port name: ex: system:capture_1*/
  DEFAULT_INPUT_R: "system:capture_2",
  /** @type {"mono"|"stereo"} Define what the default output mode will be.*/
  DEFAULT_OUTPUT_MODE: "stereo",
  /** @type {string} Left Channel for the master output. Last plug	in will connect to this. */
  DEFAULT_OUTPUT_L: "system:playback_1",
  /** @type {string} Right Channel for the master output. Last plugin will connect to this. */
  DEFAULT_OUTPUT_R: "system:playback_2",
  /** @type {boolean} Each time a plugin is added its connected to the previous and to the master output. Setting this to false will leave connections to the user. */
  AUTO_CONNECT: true,
  /** @type {boolean} Whether to reconnect all plugins or not automatically after significant changes. If false, user will have to manually reconnect with the button */
  AUTO_RECONNECT: true,
};

exports.settings = settings;
