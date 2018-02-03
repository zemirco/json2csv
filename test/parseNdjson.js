'use strict';

const parsendjson = require('../lib/parse-ndjson');

module.exports = (testRunner, jsonFixtures) => {
  testRunner.add('should parse line-delimited JSON', (t) => {
    const parsed = parsendjson(jsonFixtures.ndjson);

    t.equal(parsed.length, 4, 'parsed input has correct length');
    t.end();
  });
};