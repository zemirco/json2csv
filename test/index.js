'use strict';

const tape = require('tape');
const loadFixtures = require('./helpers/loadFixtures');
const CLI = require('./CLI');
const JSON2CSVParser = require('./JSON2CSVParser');
const JSON2CSVTransform = require('./JSON2CSVTransform');
const parseNdjson = require('./parseNdjson');

const testRunner = {
  tests: [],
  before: [],
  after: [],
  add(name, test) {
    this.tests.push({ name, test });
  },
  addBefore(func) {
    this.before.push(func);
  },
  addAfter(func) {
    this.after.push(func);
  },
  run() {
    Promise.all(testRunner.before.map(before => before()))
      .then(() => {
        this.tests.forEach(args => tape(args.name, args.test));
        this.after.forEach(after => tape.onFinish(after));
      // eslint-disable-next-line no-console
      }).catch(console.error);
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

  CLI(testRunner, jsonFixtures, csvFixtures);
  JSON2CSVParser(testRunner, jsonFixtures, csvFixtures);
  JSON2CSVTransform(testRunner, jsonFixturesStreams, csvFixtures);
  parseNdjson(testRunner, jsonFixtures);

  testRunner.run();
});