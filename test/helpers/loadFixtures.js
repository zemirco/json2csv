'use strict';

const { readdir, readFile, createReadStream } = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { promisify } = require('util');
const csvDirectory = path.join(__dirname, '../fixtures/csv');
const jsonDirectory = path.join(__dirname, '../fixtures/json');

const readdirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);


function parseToJson(fixtures) {
  return fixtures.reduce((data, fixture) => {
    data[fixture.name] = fixture.content;
    return data;
  } ,{});
}

module.exports.loadJSON = async function () {
  const filenames = await readdirAsync(jsonDirectory);
  const fixtures = await Promise.all(filenames
    .filter(filename => !filename.startsWith('.'))
    .map(async (filename) => {
      const name = path.parse(filename).name;
      const filePath = path.join(jsonDirectory, filename);
      let content;
      try {
        content = require(filePath);
      } catch (e) {
        content = await readFileAsync(filePath, 'utf-8');
      }

      return {
        name,
        content: () => content,
      };
    }));
  
  return parseToJson(fixtures);
};

module.exports.loadJSONStreams = async function () {
  const filenames = await readdirAsync(jsonDirectory);
  const fixtures = filenames
    .filter(filename => !filename.startsWith('.'))
    .map(filename => {
      return {
        name: path.parse(filename).name,
        content: ({ objectMode } = { objectMode: false }) => {
          if (objectMode) {
            return Readable.from(require(path.join(jsonDirectory, filename)));
          }
          return createReadStream(path.join(jsonDirectory, filename), { highWaterMark: 175 });
        },
      }
    });

  return parseToJson(fixtures);
};

module.exports.loadCSV = async function () {
  const filenames = await readdirAsync(csvDirectory);
  const fixtures = await Promise.all(
    filenames
      .filter(filename => !filename.startsWith('.'))
      .map(async (filename) => ({
        name: path.parse(filename).name,
        content: await readFileAsync(path.join(csvDirectory, filename), 'utf-8'),
      }))
  );

  return parseToJson(fixtures);
};
