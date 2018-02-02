'use strict';

const os = require('os');
const lodashGet = require('lodash.get');
const lodashSet = require('lodash.set');
const lodashCloneDeep = require('lodash.clonedeep');
const flatten = require('flat');

class JSON2CSVBase {
  constructor(params) {
    this.params = this.preprocessParams(params);
  }

  /**
   * Check passing params and set defaults.
   *
   * @param {Json2CsvParams} params Function parameters containing fields,
   * delimiter, default value, mark quote and header 
   */
  preprocessParams(params) {
    const processedParams = params || {};
    processedParams.unwind = !Array.isArray(processedParams.unwind)
      ? (processedParams.unwind ? [processedParams.unwind] : [])
      : processedParams.unwind
    processedParams.delimiter = processedParams.delimiter || ',';
    processedParams.eol = processedParams.eol || os.EOL;
    processedParams.quote = typeof processedParams.quote === 'string'
      ? params.quote
      : '"';
    processedParams.doubleQuote = typeof processedParams.doubleQuote === 'string'
      ? processedParams.doubleQuote
      : Array(3).join(processedParams.quote);
    processedParams.defaultValue = processedParams.defaultValue;
    processedParams.header = processedParams.header !== false;
    processedParams.includeEmptyRows = processedParams.includeEmptyRows || false;
    processedParams.withBOM = processedParams.withBOM || false;

    return processedParams;
  }

  /**
   * Create the title row with all the provided fields as column headings
   *
   * @returns {String} titles as a string
   */
  getHeader() {
    return this.params.fields
      .map(field =>
        (typeof field === 'string')
          ? field
          : (field.label || field.value)
      )
      .map(header => this.processValue(header, true))
      .join(this.params.delimiter);
  }

  /**
   * Preprocess each object according to the give params (unwind, flatten, etc.).
   *
   * @param {Object} row JSON object to be converted in a CSV row
   */
  preprocessRow(row) {
    const processedRow = (this.params.unwind && this.params.unwind.length)
      ? this.unwindData(row, this.params.unwind)
      : [row];
    if (this.params.flatten) {
      return processedRow.map(flatten);
    }

    return processedRow;
  }

  /**
   * Create the content of a specific CSV row
   *
   * @param {Object} row JSON object to be converted in a CSV row
   * @returns {String} CSV string (row)
   */
  processRow(row) {
    if (!row
        || (Object.getOwnPropertyNames(row).length === 0 
          && !this.params.includeEmptyRows)) {
      return undefined;
    }

    return this.params.fields
      .map(fieldInfo => this.processCell(row, fieldInfo))
      .join(this.params.delimiter);
  }

  /**
   * Create the content of a specfic CSV row cell
   *
   * @param {Object} row JSON object representing the  CSV row that the cell belongs to
   * @param {Object} fieldInfo Details of the field to process to be a CSV cell
   * @returns {String} CSV string (cell)
   */
  processCell(row, fieldInfo) {
    const stringify = typeof fieldInfo === 'object' && fieldInfo.stringify !== undefined
      ? fieldInfo.stringify
      : true;

    return this.processValue(this.getValue(row, fieldInfo), stringify);
  }

  /**
   * Create the content of a specfic CSV row cell
   *
   * @param {Object} row JSON object representing the  CSV row that the cell belongs to
   * @param {Object} fieldInfo Details of the field to process to be a CSV cell
   * @returns {Any} Field value
   */
  getValue(row, fieldInfo) {
    const defaultValue = typeof fieldInfo === 'object' && 'default' in fieldInfo
      ? fieldInfo.default
      : this.params.defaultValue;
    
    let value;
    if (fieldInfo) {
      if (typeof fieldInfo === 'string') {
        value = lodashGet(row, fieldInfo, defaultValue);
      } else if (typeof fieldInfo === 'object') {
        if (typeof fieldInfo.value === 'string') {
          value = lodashGet(row, fieldInfo.value, defaultValue);
        } else if (typeof fieldInfo.value === 'function') {
          const field = {
            label: fieldInfo.label,
            default: fieldInfo.default
          };
          value = fieldInfo.value(row, field);
        }
      }
    }

    return (value === null || value === undefined)
      ? defaultValue
      : value;
  }

  /**
   * Create the content of a specfic CSV row cell
   *
   * @param {Any} value Value to be included in a CSV cell
   * @param {Boolean} stringify Details of the field to process to be a CSV cell
   * @returns {String} Value stringified and processed
   */
  processValue(value, stringify) {
    if (value === null || value === undefined) {
      return undefined;
    }

    const isValueString = typeof value === 'string';
    if (isValueString) {
      value = value
        .replace(/\n/g, '\u2028')
        .replace(/\r/g, '\u2029');
    }

    //JSON.stringify('\\') results in a string with two backslash
    //characters in it. I.e. '\\\\'.
    let stringifiedValue = (stringify
      ? JSON.stringify(value)
      : value);

    if (typeof value === 'object' && !/^"(.*)"$/.test(stringifiedValue)) {
      // Stringify object that are not stringified to a
      // JSON string (like Date) to escape commas, quotes, etc.
      stringifiedValue = JSON.stringify(stringifiedValue);
    }

    if (stringifiedValue === undefined) {
      return undefined;
    }

    if (isValueString) {
      stringifiedValue = stringifiedValue
        .replace(/\u2028/g, '\n')
        .replace(/\u2029/g, '\r');
    }

    //Replace single quote with double quote. Single quote are preceeded by
    //a backslash, and it's not at the end of the stringifiedValue.
    stringifiedValue = stringifiedValue
      .replace(/^"(.*)"$/, this.params.quote + '$1' + this.params.quote)
      .replace(/(\\")(?=.)/g, this.params.doubleQuote)
      .replace(/\\\\/g, '\\');

    if (this.params.excelStrings && typeof value === 'string') {
      stringifiedValue = '"="' + stringifiedValue + '""';
    }

    return stringifiedValue;
  }

  /**
   * Performs the unwind recursively in specified sequence
   *
   * @param {Array} dataRow Original JSON object
   * @param {String[]} unwindPaths The paths as strings to be used to deconstruct the array
   * @returns {Array} Array of objects containing all rows after unwind of chosen paths
   */
  unwindData(dataRow, unwindPaths) {
    return Array.prototype.concat.apply([],
      unwindPaths.reduce((data, unwindPath) =>
        Array.prototype.concat.apply([],
          data.map((dataEl) => {
            const unwindArray = lodashGet(dataEl, unwindPath);

            if (!Array.isArray(unwindArray)) {
              return dataEl;
            }

            if (unwindArray.length) {
              return unwindArray.map((unwindEl) => {
                const dataCopy = lodashCloneDeep(dataEl);
                lodashSet(dataCopy, unwindPath, unwindEl);
                return dataCopy;
              });
            }

            const dataCopy = lodashCloneDeep(dataEl);
            lodashSet(dataCopy, unwindPath, undefined);
            return dataCopy;
          })
        ),
        [dataRow]
      )
    )
  }
}

module.exports = JSON2CSVBase;
