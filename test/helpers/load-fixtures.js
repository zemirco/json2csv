'use strict';

const fs = require('fs');
const path = require('path');
const csvDirectory = path.join(__dirname, '../fixtures/csv');
const jsonDirectory = path.join(__dirname, '../fixtures/json');

function getFilesInDirectory(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, filenames) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(filenames);
    });
  })
}

function parseToJson(fixtures) {
  return fixtures.reduce((data, fixture) => {
    data[fixture.name] = fixture.csv;
    return data;
  } ,{})
}

module.exports.loadJSON = function () {
  return getFilesInDirectory(jsonDirectory)
    .then(filenames => filenames.map((filename) => {
      const filePath = path.join(jsonDirectory, filename);
      return {
        name: path.parse(filename).name,
        csv: require(filePath)
      };
    }))
    .then(parseToJson);
};

module.exports.loadCSV = function () {
  return getFilesInDirectory(csvDirectory)
    .then(filenames => Promise.all(filenames.map((filename) => {
      return new Promise((resolve, reject) => {
        const filePath = path.join(csvDirectory, filename);
        fs.readFile(filePath, 'utf-8', (err, data) => {
          if (err) {
            reject(err);
            return;
          }

          resolve({
            name: path.parse(filename).name,
            csv: data.toString()
          });
        });
      });
    })))
    .then(parseToJson);
};
