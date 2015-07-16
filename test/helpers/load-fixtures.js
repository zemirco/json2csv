'use strict';

var fs = require('fs');
var path = require('path');
var fixtures = [
  'default',
  'withoutTitle',
  'withoutQuotes',
  'withNotExistField',
  'quotes',
  'selected',
  'reversed',
  'tsv',
  'eol',
  'fieldNames',
  'withSimpleQuotes',
  'nested'
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
