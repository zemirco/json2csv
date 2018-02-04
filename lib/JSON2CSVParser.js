'use strict';

const JSON2CSVBase = require('./JSON2CSVBase');

class JSON2CSVParser extends JSON2CSVBase {
  /**
   * Main function that converts json to csv.
   *
   * @param {Array|Object} data Array of JSON objects to be converted to CSV
   * @returns {String} The CSV formated data as a string
   */
  parse(data) {
    const processedData = this.preprocessData(data);

    if (!this.params.fields) {
      const dataFields = Array.prototype.concat.apply([],
        processedData.map(item => Object.keys(item))
      );
      this.params.fields = dataFields
        .filter((field, pos, arr) => arr.indexOf(field) == pos);
    }

    const header = this.params.header ? this.getHeader() : '';
    const rows = this.processData(processedData);
    const csv = (this.params.withBOM ? '\ufeff' : '')
      + header
      + ((header && rows) ? this.params.eol : '')
      + rows;

    return csv;
  }

  /**
   * Preprocess the data according to the give params (unwind, flatten, etc.)
    and calculate the fields and field names if they are not provided.
   *
   * @param {Array|Object} data Array or object to be converted to CSV
   */
  preprocessData(data) {
    const processedData = Array.isArray(data) ? data : [data];

    if (processedData.length === 0 || typeof processedData[0] !== 'object') {
      throw new Error('params should include "fields" and/or non-empty "data" array of objects');
    }

    return Array.prototype.concat.apply([],
      processedData.map(row => this.preprocessRow(row))
    );
  }

  /**
   * Create the content row by row below the header
   *
   * @param {Array} data Array of JSON objects to be converted to CSV
   * @returns {String} CSV string (body)
   */
  processData(data) {
    return data
      .map(row => this.processRow(row))
      .filter(row => row) // Filter empty rows
      .join(this.params.eol);
  }
}

module.exports = JSON2CSVParser;