'use strict';

const JSON2CSVParser = require('./JSON2CSVParser');
const JSON2CSVAsyncParser = require('./JSON2CSVAsyncParser');
const JSON2CSVTransform = require('./JSON2CSVTransform');

module.exports.Parser = JSON2CSVParser;
module.exports.AsyncParser = JSON2CSVAsyncParser;
module.exports.Transform = JSON2CSVTransform;

// Convenience method to keep the API similar to version 3.X
module.exports.parse = (data, opts) => new JSON2CSVParser(opts).parse(data);
module.exports.parseAsync = (data, opts, transformOpts) => {
  const asyncParser = new JSON2CSVAsyncParser(opts, transformOpts);
  const promise = asyncParser.promise();

  data.forEach(item => asyncParser.input.push(item));
  asyncParser.input.push(null);

  return promise;
};
