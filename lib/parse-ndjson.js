'use strict';

function parseNdJson(input) {
  return input
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .map(line=> JSON.parse(line));
}

module.exports = parseNdJson;
