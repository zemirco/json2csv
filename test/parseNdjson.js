'use strict';

const parsendjson = require('../bin/utils/parseNdjson');

module.exports = (testRunner, jsonFixtures) => {
  testRunner.add('should parse line-delimited JSON', (t) => {
    const parsed = parsendjson(jsonFixtures.ndjson());

    t.equal(parsed.length, 4, 'parsed input has correct length');
  });
};