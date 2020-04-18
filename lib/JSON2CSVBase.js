'use strict';

const os = require('os');
const lodashGet = require('lodash.get');
const { getProp, fastJoin, flattenReducer } = require('./utils');

class JSON2CSVBase {
  constructor(opts) {
    this.opts = this.preprocessOpts(opts);
  }

  /**
   * Check passing opts and set defaults.
   *
   * @param {Json2CsvOptions} opts Options object containing fields,
   * delimiter, default value, quote mark, header, etc.
   */
  preprocessOpts(opts) {
    const processedOpts = Object.assign({}, opts);
    processedOpts.transforms = !Array.isArray(processedOpts.transforms)
      ? (processedOpts.transforms ? [processedOpts.transforms] : [])
      : processedOpts.transforms
    processedOpts.delimiter = processedOpts.delimiter || ',';
    processedOpts.eol = processedOpts.eol || os.EOL;
    processedOpts.quote = typeof processedOpts.quote === 'string'
      ? processedOpts.quote
      : '"';
    processedOpts.escapedQuote = typeof processedOpts.escapedQuote === 'string'
      ? processedOpts.escapedQuote
      : `${processedOpts.quote}${processedOpts.quote}`;
    processedOpts.header = processedOpts.header !== false;
    processedOpts.includeEmptyRows = processedOpts.includeEmptyRows || false;
    processedOpts.withBOM = processedOpts.withBOM || false;

    return processedOpts;
  }

  /**
   * Check and normalize the fields configuration.
   *
   * @param {(string|object)[]} fields Fields configuration provided by the user
   * or inferred from the data
   * @returns {object[]} preprocessed FieldsInfo array
   */
  preprocessFieldsInfo(fields) {
    return fields.map((fieldInfo) => {
      if (typeof fieldInfo === 'string') {
        return {
          label: fieldInfo,
          value: (fieldInfo.includes('.') || fieldInfo.includes('['))
            ? row => lodashGet(row, fieldInfo, this.opts.defaultValue)
            : row => getProp(row, fieldInfo, this.opts.defaultValue),
        };
      }

      if (typeof fieldInfo === 'object') {
        const defaultValue = 'default' in fieldInfo
          ? fieldInfo.default
          : this.opts.defaultValue;

        if (typeof fieldInfo.value === 'string') {
          return {
            label: fieldInfo.label || fieldInfo.value,
            value: (fieldInfo.value.includes('.') || fieldInfo.value.includes('['))
              ? row => lodashGet(row, fieldInfo.value, defaultValue)
              : row => getProp(row, fieldInfo.value, defaultValue),
          };
        }

        if (typeof fieldInfo.value === 'function') {
          const label = fieldInfo.label || fieldInfo.value.name || '';
          const field = { label, default: defaultValue };
          return {
            label,
            value(row) {
              const value = fieldInfo.value(row, field);
              return (value === null || value === undefined)
                ? defaultValue
                : value;
            },
          }
        }
      }

      throw new Error('Invalid field info option. ' + JSON.stringify(fieldInfo));
    });
  }

  /**
   * Create the title row with all the provided fields as column headings
   *
   * @returns {String} titles as a string
   */
  getHeader() {
    return fastJoin(
      this.opts.fields.map(fieldInfo => this.processValue(fieldInfo.label)),
      this.opts.delimiter
    );
  }

  /**
   * Preprocess each object according to the given transforms (unwind, flatten, etc.).
   * @param {Object} row JSON object to be converted in a CSV row
   */
  preprocessRow(row) {
    return this.opts.transforms.reduce((rows, transform) =>
      rows.map(row => transform(row)).reduce(flattenReducer, []),
      [row]
    );
  }

  /**
   * Create the content of a specific CSV row
   *
   * @param {Object} row JSON object to be converted in a CSV row
   * @returns {String} CSV string (row)
   */
  processRow(row) {
    if (!row) {
      return undefined;
    }

    const processedRow = this.opts.fields.map(fieldInfo => this.processCell(row, fieldInfo));

    if (!this.opts.includeEmptyRows && processedRow.every(field => field === undefined)) {
      return undefined;
    }

    return fastJoin(
      processedRow,
      this.opts.delimiter
    );
  }

  /**
   * Create the content of a specfic CSV row cell
   *
   * @param {Object} row JSON object representing the  CSV row that the cell belongs to
   * @param {FieldInfo} fieldInfo Details of the field to process to be a CSV cell
   * @returns {String} CSV string (cell)
   */
  processCell(row, fieldInfo) {
    return this.processValue(fieldInfo.value(row));
  }

  /**
   * Create the content of a specfic CSV row cell
   *
   * @param {Any} value Value to be included in a CSV cell
   * @returns {String} Value stringified and processed
   */
  processValue(value) {
    if (value === null || value === undefined) {
      return undefined;
    }

    const valueType = typeof value;
    if (valueType !== 'boolean' && valueType !== 'number' && valueType !== 'string') {
      value = JSON.stringify(value);

      if (value === undefined) {
        return undefined;
      }

      if (value[0] === '"') {
        value = value.replace(/^"(.+)"$/,'$1');
      }
    }

    if (typeof value === 'string') {
      if(value.includes(this.opts.quote)) {
        value = value.replace(new RegExp(this.opts.quote, 'g'), this.opts.escapedQuote);
      }

      value = `${this.opts.quote}${value}${this.opts.quote}`;

      if (this.opts.excelStrings) {
        value = `"="${value}""`;
      }
    }

    return value;
  }
}

module.exports = JSON2CSVBase;
