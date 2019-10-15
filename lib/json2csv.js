'use strict';

const { Readable } = require('stream');
const JSON2CSVParser = require('./JSON2CSVParser');
const JSON2CSVAsyncParser = require('./JSON2CSVAsyncParser');
const JSON2CSVTransform = require('./JSON2CSVTransform');
const flatten = require('./transforms/flatten');
const unwind = require('./transforms/unwind');

module.exports.Parser = JSON2CSVParser;
module.exports.AsyncParser = JSON2CSVAsyncParser;
module.exports.Transform = JSON2CSVTransform;

// Convenience method to keep the API similar to version 3.X
module.exports.parse = (data, opts) => new JSON2CSVParser(opts).parse(data);
module.exports.parseAsync = (data, opts, transformOpts) => {
  try {
    if (!(data instanceof Readable)) {
      transformOpts = Object.assign({}, transformOpts, { objectMode: true });
    }

    const asyncParser = new JSON2CSVAsyncParser(opts, transformOpts);
    const promise = asyncParser.promise();

    if (Array.isArray(data)) {
      data.forEach(item => asyncParser.input.push(item));
      asyncParser.input.push(null);
    } else if (data instanceof Readable) {
      asyncParser.fromInput(data);
    } else {
      asyncParser.input.push(data);
      asyncParser.input.push(null);
    }

    return promise;
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports.transforms = {
  flatten,
  unwind,
};