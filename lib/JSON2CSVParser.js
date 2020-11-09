'use strict';

const JSON2CSVBase = require('./JSON2CSVBase');

class JSON2CSVParser extends JSON2CSVBase {
  constructor(opts) {
    super(opts);
  }
  /**
   * Main function that converts json to csv.
   *
   * @param {Array|Object} data Array of JSON objects to be converted to CSV
   * @returns {String} The CSV formated data as a string
   */
  parse(data) {
    const processedData = this.preprocessData(data, this.opts.fields);

    const fields = this.opts.fields || this.preprocessFieldsInfo(processedData
      .reduce((fields, item) => {
        Object.keys(item).forEach((field) => {
          if (!fields.includes(field)) {
            fields.push(field)
          }
        });

        return fields
      }, []));

    const header = this.opts.header ? this.getHeader(fields) : '';
    const rows = this.processData(processedData, fields);
    const csv = (this.opts.withBOM ? '\ufeff' : '')
      + header
      + ((header && rows) ? this.opts.eol : '')
      + rows;

    return csv;
  }

  /**
   * Preprocess the data according to the give opts (unwind, flatten, etc.)
    and calculate the fields and field names if they are not provided.
   *
   * @param {Array|Object} data Array or object to be converted to CSV
   */
  preprocessData(data, fields) {
    const processedData = Array.isArray(data) ? data : [data];

    if (!fields && (processedData.length === 0 || typeof processedData[0] !== 'object')) {
      throw new Error('Data should not be empty or the "fields" option should be included');
    }

    if (this.opts.transforms.length === 0) return processedData;

    return processedData
      .flatMap(row => this.preprocessRow(row));
  }

  /**
   * Create the content row by row below the header
   *
   * @param {Array} data Array of JSON objects to be converted to CSV
   * @returns {String} CSV string (body)
   */
  processData(data, fields) {
    return data
      .map(row => this.processRow(row, fields))
      .filter(row => row) // Filter empty rows
      .join(this.opts.eol);
  }
}

module.exports = JSON2CSVParser;
