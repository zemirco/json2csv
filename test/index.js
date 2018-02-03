'use strict';

const tape = require('tape');
const loadFixtures = require('./helpers/loadFixtures');
const JSON2CSVParser = require('./JSON2CSVParser');
const JSON2CSVTransform = require('./JSON2CSVTransform');
const parseNdjson = require('./parseNdjson');

const testRunner = {
  tests: [],
  add(name, test) {
    this.tests.push({ name, test });
  },
  run() {
    this.tests.map(args => tape(args.name, args.test));
  }
};

Promise.all([
  loadFixtures.loadJSON(),
  loadFixtures.loadJSONStreams(),
  loadFixtures.loadCSV()])
.then((fixtures) => {
  const jsonFixtures = fixtures[0];
  const jsonFixturesStreams = fixtures[1];
  const csvFixtures = fixtures[2];

  JSON2CSVParser(testRunner, jsonFixtures, csvFixtures);
  JSON2CSVTransform(testRunner, jsonFixturesStreams, csvFixtures);
  parseNdjson(testRunner, jsonFixtures);

  testRunner.run();
});