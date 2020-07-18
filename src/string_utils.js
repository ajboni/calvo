/**
 * Assorted string utils.
 * @module string_utils
 */

/**
 * Removes new lines in a string
 *
 * @param {*} str string to remove lines.
 * @returns the formatted string
 */
function removeNewLines(str) {
  return str.replace(/(\r\n|\n|\r)/gm, "");
}

/**
 *
 * Converts a multiline text into a string array, trimming each line
 * @param {*} str
 * @returns A strimmed array
 */
function stringToTrimmedArray(str) {
  const arr = str.split("\n").map((item) => item.trim());
  return arr;
}

/**
 * Convert a string to a "safe" only letters string.
 *
 * @param {string} str String to convert
 * @returns A-Za-z
 */
function safe(str) {
  s = str.replace(/[^A-Za-z0-9]/g, "");
  return s;
}

exports.removeNewLines = removeNewLines;
exports.stringToTrimmedArray = stringToTrimmedArray;
exports.safe = safe;
