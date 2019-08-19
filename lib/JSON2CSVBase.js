'use strict';

const os = require('os');
const lodashGet = require('lodash.get');
const { getProp, setProp, fastJoin, flattenReducer } = require('./utils');

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
      : processedOpts.quote + processedOpts.quote;
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
            value: (fieldInfo.value.includes('.') || fieldInfo.value.includes('['))
              ? row => lodashGet(row, fieldInfo.value, defaultValue)
              : row => getProp(row, fieldInfo.value, defaultValue),
            stringify: fieldInfo.stringify !== undefined ? fieldInfo.stringify : true,
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
    return fastJoin(
      this.opts.fields.map(fieldInfo => this.processValue(fieldInfo.label, true)),
      this.opts.delimiter
    );
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
        value = value.replace(new RegExp(this.opts.quote, 'g'), this.opts.doubleQuote);
      }

      // This should probably be remove together with the whole strignify option
      if (stringify) {
        value = `${this.opts.quote}${value}${this.opts.quote}`;
      } else {
        value = value
          .replace(new RegExp(`^${this.opts.doubleQuote}`), this.opts.quote)
          .replace(new RegExp(`${this.opts.doubleQuote}$`), this.opts.quote);
      }

      if (this.opts.excelStrings) {
        value = `"="${value}""`;
      }
    }

    return value;
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
