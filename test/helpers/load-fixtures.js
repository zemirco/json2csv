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
module.exports = function (result) {
  return fixtures.map(function (key) {
    return function (callback) {
      fs.readFile(path.join(__dirname, '../fixtures/csv', key + '.csv'), function (err, data) {
        if (err) {
          callback(err);
        }

        result[key] = data.toString();
        callback(null);
      });
    };
  });
};
/*eslint-enable no-console*/
