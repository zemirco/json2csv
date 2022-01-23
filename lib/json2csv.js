'use strict';

const JSON2CSVParser = require('./JSON2CSVParser');
const JSON2CSVAsyncParser = require('./JSON2CSVAsyncParser');
const JSON2CSVStreamParser = require('./JSON2CSVStreamParser');
const JSON2CSVTransform = require('./JSON2CSVTransform');

// Transforms
const flatten = require('./transforms/flatten');
const unwind = require('./transforms/unwind');

// Formatters
const defaultFormatter = require('./formatters/default');
const number = require('./formatters/number');
const string = require('./formatters/string');
const stringQuoteOnlyIfNecessary =  require('./formatters/stringQuoteOnlyIfNecessary');
const stringExcel = require('./formatters/stringExcel');
const symbol = require('./formatters/symbol');
const object = require('./formatters/object');

module.exports.Parser = JSON2CSVParser;
module.exports.AsyncParser = JSON2CSVAsyncParser;
module.exports.StreamParser = JSON2CSVStreamParser;
module.exports.Transform = JSON2CSVTransform;

// Convenience method to keep the API similar to version 3.X
module.exports.parse = (data, opts) => new JSON2CSVParser(opts).parse(data);
module.exports.parseAsync = (data, opts, transformOpts) => new JSON2CSVAsyncParser(opts, transformOpts).parse(data).promise();

module.exports.transforms = {
  flatten,
  unwind,
};

module.exports.formatters = {
  default: defaultFormatter,
  number,
  string,
  stringQuoteOnlyIfNecessary,
  stringExcel,
  symbol,
  object,
};
