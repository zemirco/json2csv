'use strict';

const { Readable } = require('stream');
const JSON2CSVTransform = require('./JSON2CSVTransform');

class JSON2CSVAsyncParser {
  constructor(opts, transformOpts) {
    this.opts = opts;
    this.transformOpts = transformOpts;
  }

  /**
   * Main function that converts json to csv.
   *
   * @param {Stream|Array|Object} data Array of JSON objects to be converted to CSV
   * @returns {Stream} A stream producing the CSV formated data as a string
   */
  parse(data) {
    if (typeof data !== 'object') {
      throw new Error('Data should not be empty or the "fields" option should be included');
    }

    if (!(data instanceof Readable)) {
      data = Readable.from((Array.isArray(data) ? data : [data]).filter(obj => obj !== null));
    }

    return data.pipe(new JSON2CSVTransform(this.opts, { objectMode: data.readableObjectMode, ...this.transformOpts }))
  }
}

module.exports = JSON2CSVAsyncParser;
