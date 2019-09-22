'use strict';

const tape = require('tape');
const loadFixtures = require('./helpers/loadFixtures');
const CLI = require('./CLI');
const JSON2CSVParser = require('./JSON2CSVParser');
const JSON2CSVAsyncParser = require('./JSON2CSVAsyncParser');
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
  async run() {
    try {
      await Promise.all(testRunner.before.map(before => before()));
      this.tests.forEach(args => tape(args.name, args.test));
      this.after.forEach(after => tape.onFinish(after));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
};

async function loadAllFixtures() {
  return Promise.all([
    loadFixtures.loadJSON(),
    loadFixtures.loadJSONStreams(),
    loadFixtures.loadCSV()
  ]);
}

async function setupTests([jsonFixtures, jsonFixturesStreams, csvFixtures]) {
  CLI(testRunner, jsonFixtures, csvFixtures);
  JSON2CSVParser(testRunner, jsonFixtures, csvFixtures);
  JSON2CSVAsyncParser(testRunner, jsonFixturesStreams, csvFixtures, jsonFixtures);
  JSON2CSVTransform(testRunner, jsonFixturesStreams, csvFixtures, jsonFixtures);
  parseNdjson(testRunner, jsonFixtures);
}

loadAllFixtures()
  .then(setupTests)
  .then(() => testRunner.run());