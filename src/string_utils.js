function removeNewLines(str) {
  return str.replace(/(\r\n|\n|\r)/gm, "");
}

/**
 * Converts a multiline text into a string array, trimming each line
 *
 * @param {*} str
 */
function stringToTrimmedArray(str) {
  const arr = str.split("\n").map((item) => item.trim());
  return arr;
}

exports.removeNewLines = removeNewLines;
exports.stringToTrimmedArray = stringToTrimmedArray;
