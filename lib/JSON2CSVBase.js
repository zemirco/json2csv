'use strict';

const os = require('os');
const lodashGet = require('lodash.get');
const lodashSet = require('lodash.set');
const lodashCloneDeep = require('lodash.clonedeep');

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
    const processedOpts = opts || {};
    processedOpts.unwind = !Array.isArray(processedOpts.unwind)
      ? (processedOpts.unwind ? [processedOpts.unwind] : [])
      : processedOpts.unwind
    processedOpts.delimiter = processedOpts.delimiter || ',';
    processedOpts.eol = processedOpts.eol || os.EOL;
    processedOpts.quote = typeof processedOpts.quote === 'string'
      ? opts.quote
      : '"';
    processedOpts.doubleQuote = typeof processedOpts.doubleQuote === 'string'
      ? processedOpts.doubleQuote
      : Array(3).join(processedOpts.quote);
    processedOpts.defaultValue = processedOpts.defaultValue;
    processedOpts.header = processedOpts.header !== false;
    processedOpts.includeEmptyRows = processedOpts.includeEmptyRows || false;
    processedOpts.withBOM = processedOpts.withBOM || false;

    return processedOpts;
  }

  /**
   * Create the title row with all the provided fields as column headings
   *
   * @returns {String} titles as a string
   */
  getHeader() {
    return this.opts.fields
      .map(field =>
        (typeof field === 'string')
          ? field
          : (field.label || field.value)
      )
      .map(header => this.processValue(header, true))
      .join(this.opts.delimiter);
  }

  /**
   * Preprocess each object according to the give opts (unwind, flatten, etc.).
   *
   * @param {Object} row JSON object to be converted in a CSV row
   */
  preprocessRow(row) {
    const processedRow = (this.opts.unwind && this.opts.unwind.length)
      ? this.unwindData(row, this.opts.unwind)
      : [row];

    if (this.opts.flatten) {
      return processedRow.map(this.flatten);
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
          && !this.opts.includeEmptyRows)) {
      return undefined;
    }

    return this.opts.fields
      .map(fieldInfo => this.processCell(row, fieldInfo))
      .join(this.opts.delimiter);
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
      : this.opts.defaultValue;

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


    if (this.opts.quote === '"') {
      // Replace automatically scaped single quotes by doubleQuotes
      stringifiedValue = stringifiedValue
        .replace(/(\\")(?!$)/g, this.opts.doubleQuote);
    } else {
      // Unescape automatically escaped double quote symbol
      // Replace wrapping quotes
      // Replace single quote with double quote
      stringifiedValue = stringifiedValue
        .replace(/(\\")(?!$)/g, '"')
        .replace(new RegExp(this.opts.quote, 'g'), this.opts.doubleQuote)
        .replace(/^"(.*)"$/, this.opts.quote + '$1' + this.opts.quote);
    }

      // Remove double backslashes
      stringifiedValue = stringifiedValue
        .replace(/\\\\/g, '\\');

    if (this.opts.excelStrings && typeof value === 'string') {
      stringifiedValue = '"="' + stringifiedValue + '""';
    }

    return stringifiedValue;
  }

  /**
   * Performs the flattening of a data row recursively
   *
   * @param {Object} dataRow Original JSON object
   * @returns {Object} Flattened object
   */
  flatten(dataRow) {
    function step (obj, flatDataRow, currentPath) {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];

        const newPath = currentPath
          ? `${currentPath}.${key}`
          : key;

        if (typeof value !== 'object'
          || value === null
          || Array.isArray(value)
          || Object.prototype.toString.call(value.toJSON) === '[object Function]'
          || !Object.keys(value).length) {
          flatDataRow[newPath] = value;
          return;
        }

        step(value, flatDataRow, newPath);
      });

      return flatDataRow;
    }

    return step(dataRow, {});
  }

  /**
   * Performs the unwind recursively in specified sequence
   *
   * @param {Object} dataRow Original JSON object
   * @param {String[]} unwindPaths The paths as strings to be used to deconstruct the array
   * @returns {Array} Array of objects containing all rows after unwind of chosen paths
  */
  unwindData(dataRow, unwindPaths) {
    const unwind = (rows, unwindPath) => {
      const clone = unwindPath.indexOf('.') !== -1
        ? o => lodashCloneDeep(o)
        : o => Object.assign({}, o);

      return rows
        .map(row => {
          const unwindArray = lodashGet(row, unwindPath);

          if (!Array.isArray(unwindArray)) {
            return row;
          }

          if (!unwindArray.length) {
            return lodashSet(clone(row), unwindPath, undefined);
          }

          return unwindArray.map((unwindRow, index) => {
            const clonedRow = (this.opts.unwindBlank && index > 0)
              ? {}
              : clone(row);

            return lodashSet(clonedRow, unwindPath, unwindRow);
          });
        })
        .reduce((a, e) => a.concat(e), []);
    };

    return unwindPaths.reduce(unwind, [dataRow]);
  }
}

module.exports = JSON2CSVBase;
