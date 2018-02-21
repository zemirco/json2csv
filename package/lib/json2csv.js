'use strict';

const JSON2CSVParser = require('./JSON2CSVParser');
const JSON2CSVTransform = require('./JSON2CSVTransform');

module.exports.Parser = JSON2CSVParser;
module.exports.Transform = JSON2CSVTransform;

// Convenience method to keep the API similar to version 3.X
module.exports.parse = (data, opts) => new JSON2CSVParser(opts).parse(data);
