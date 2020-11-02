'use strict';

const { Readable, Transform } = require('stream');
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
    if (data instanceof Readable) {
      return data.pipe(new JSON2CSVTransform(this.opts, this.transformOpts));
    } else if (typeof data === 'object') {
      return Readable.from((Array.isArray(data) ? data : [data]).filter(obj => obj !== null))
        .pipe(new JSON2CSVTransform(this.opts, { ...this.transformOpts, objectMode: true }));
    } else {
      throw new Error('Data should not be empty or the "fields" option should be included');
    }
  }
}

module.exports = JSON2CSVAsyncParser;
