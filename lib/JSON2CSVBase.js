'use strict';

const os = require('os');
const lodashGet = require('lodash.get');
const { setProp, flattenReducer } = require('./utils');

class JSON2CSVBase {
  constructor(opts) {
    this.opts = this.preprocessOpts(opts);
    this.preprocessRow = this.memoizePreprocessRow();
  }

  /**
   * Check passing opts and set defaults.
   *
   * @param {Json2CsvOptions} opts Options object containing fields,
   * delimiter, default value, quote mark, header, etc.
   */
  preprocessOpts(opts) {
    const processedOpts = Object.assign({}, opts);
    processedOpts.unwind = !Array.isArray(processedOpts.unwind)
      ? (processedOpts.unwind ? [processedOpts.unwind] : [])
      : processedOpts.unwind
    processedOpts.delimiter = processedOpts.delimiter || ',';
    processedOpts.flattenSeparator = processedOpts.flattenSeparator || '.';
    processedOpts.eol = processedOpts.eol || os.EOL;
    processedOpts.quote = typeof processedOpts.quote === 'string'
      ? opts.quote
      : '"';
    processedOpts.doubleQuote = typeof processedOpts.doubleQuote === 'string'
      ? processedOpts.doubleQuote
      : Array(3).join(processedOpts.quote);
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
          value: row => lodashGet(row, fieldInfo, this.opts.defaultValue),
          stringify: true,
        };
      }

      if (typeof fieldInfo === 'object') {
        const defaultValue = 'default' in fieldInfo
          ? fieldInfo.default
          : this.opts.defaultValue;

        if (typeof fieldInfo.value === 'string') {
          return {
            label: fieldInfo.label || fieldInfo.value,
            value: row => lodashGet(row, fieldInfo.value, defaultValue),
            stringify: fieldInfo.stringify !== undefined ? fieldInfo.stringify : true,
          };
        }

        if (typeof fieldInfo.value === 'function') {
          const label = fieldInfo.label || fieldInfo.value;
          const field = { label, default: defaultValue };
          return {
            label,
            value(row) {
              const value = fieldInfo.value(row, field);
              return (value === null || value === undefined)
                ? defaultValue
                : value;
            },
            stringify: fieldInfo.stringify !== undefined ? fieldInfo.stringify : true,
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
    return this.opts.fields
      .map(fieldInfo => this.processValue(fieldInfo.label, true))
      .join(this.opts.delimiter);
  }

  memoizePreprocessRow() {
    if (this.opts.unwind && this.opts.unwind.length) {
      if (this.opts.flatten) {
        return function (row) {
          return this.unwindData(row, this.opts.unwind)
            .map(row => this.flatten(row, this.opts.flattenSeparator));
        };
      }
      
      return function (row) {
        return this.unwindData(row, this.opts.unwind);
      };
    }
    
    if (this.opts.flatten) {
      return function (row) {
        return [this.flatten(row, this.opts.flattenSeparator)];
      };
    }
    
    return function (row) {
      return [row];
    };
  }

  /**
   * Preprocess each object according to the give opts (unwind, flatten, etc.).
   * The actual body of the function is dynamically set on the constructor by the
   *  `memoizePreprocessRow` method after parsing the options.
   *
   * @param {Object} row JSON object to be converted in a CSV row
   */
  preprocessRow() {}

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
   * @param {FieldInfo} fieldInfo Details of the field to process to be a CSV cell
   * @returns {String} CSV string (cell)
   */
  processCell(row, fieldInfo) {
    return this.processValue(fieldInfo.value(row), fieldInfo.stringify);
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
        .replace(/\r/g, '\u2029')
        .replace(/\t/g, '\u21E5');
    }

    //JSON.stringify('\\') results in a string with two backslash
    //characters in it. I.e. '\\\\'.
    let stringifiedValue = (stringify
      ? JSON.stringify(value)
      : value);

    if (typeof value === 'object' && !/^".*"$/.test(stringifiedValue)) {
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
        .replace(/\u2029/g, '\r')
        .replace(/\u21E5/g, '\t');
    }

    if (this.opts.quote === '"') {
      // Replace automatically escaped single quotes by doubleQuotes
      stringifiedValue = stringifiedValue
        .replace(/\\"(?!$)/g, this.opts.doubleQuote);
    } else {
      // Unescape double quotes ('"')
      // Replace single quote with double quote
      // Replace wrapping quotes
      stringifiedValue = stringifiedValue
        .replace(/\\"(?!$)/g, '"')
        .replace(new RegExp(this.opts.quote, 'g'), this.opts.doubleQuote)
        .replace(/^"/, this.opts.quote)
        .replace(/"$/, this.opts.quote);
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
   * @param {String} separator Separator to be used as the flattened field name
   * @returns {Object} Flattened object
   */
  flatten(dataRow, separator) {
    function step (obj, flatDataRow, currentPath) {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];

        const newPath = currentPath
          ? `${currentPath}${separator}${key}`
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
      return rows
        .map(row => {
          const unwindArray = lodashGet(row, unwindPath);

          if (!Array.isArray(unwindArray)) {
            return row;
          }

          if (!unwindArray.length) {
            return setProp(row, unwindPath, undefined);
          }

          return unwindArray.map((unwindRow, index) => {
            const clonedRow = (this.opts.unwindBlank && index > 0)
              ? {}
              : row;

            return setProp(clonedRow, unwindPath, unwindRow);
          });
        })
        .reduce(flattenReducer, []);
    };

    return unwindPaths.reduce(unwind, [dataRow]);
  }
}

module.exports = JSON2CSVBase;
