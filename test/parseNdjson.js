'use strict';

const os = require('os');
const parsendjson = require('../bin/utils/parseNdjson');

module.exports = (testRunner, jsonFixtures) => {
  testRunner.add('should parse line-delimited JSON', (t) => {
    const parsed = parsendjson(jsonFixtures.ndjson(), os.EOL);

    t.equal(parsed.length, 4, 'parsed input has correct length');
  });
};