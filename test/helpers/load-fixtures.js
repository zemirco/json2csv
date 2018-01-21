'use strict';

var fs = require('fs');
var path = require('path');
var fixtures = [
  'default',
  'delimiter',
  'withoutTitle',
  'withoutQuotes',
  'withNotExistField',
  'quotes',
  'backslashAtEnd',
  'backslashAtEndInMiddleColumn',
  'date',
  'selected',
  'reversed',
  'tsv',
  'eol',
  'fieldNames',
  'withSimpleQuotes',
  'nested',
  'defaultValue',
  'defaultValueEmpty',
  'embeddedjson',
  'flattenedEmbeddedJson',
  'fancyfields',
  'functionStringifyByDefault',
  'functionNoStringify',
  'trailingBackslash',
  'excelStrings',
  'overriddenDefaultValue',
  'emptyRow',
  'emptyRowNotIncluded',
  'emptyRowDefaultValues',
  'unwind',
  'unwind2',
  'withBOM',
];

/*eslint-disable no-console*/
module.exports = function () {
  return Promise.all(fixtures.map(key => new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, '../fixtures/csv', key + '.csv'), function (err, data) {
      if (err) {
        reject(err);
        return;
      }

      resolve(data.toString());
    });
  })))
  .then(data => data.reduce(function (results, fixture, i) {
    results[fixtures[i]] = fixture;
    return results;
  } ,{}));
};
/*eslint-enable no-console*/
