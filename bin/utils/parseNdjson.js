'use strict';

function parseNdJson(input, eol) {
  return input
    .split(eol)
    .map(line => line.trim())
    .filter(line => line !== '')
    .map(line=> JSON.parse(line));
}

module.exports = parseNdJson;
