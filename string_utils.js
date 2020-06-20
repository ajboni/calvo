function removeNewLines(str) {
  return str.replace(/(\r\n|\n|\r)/gm, "");
}

exports.removeNewLines = removeNewLines;
