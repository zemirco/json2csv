'use strict';

/**
 * Module dependencies.
 */
const os = require('os');
const lodashGet = require('lodash.get');
const lodashSet = require('lodash.set');
const lodashCloneDeep = require('lodash.clonedeep');
const flatten = require('flat');

/**
 * @name Json2CsvParams
 * @typedef {Object}
 * @property {Array} [fields] - see documentation for details
 * @property {String[]} [unwind] - similar to MongoDB's $unwind, Deconstructs an array field from the input JSON to output a row for each element
 * @property {Boolean} [flatten=false] - flattens nested JSON using flat (https://www.npmjs.com/package/flat)
 * @property {String} [defaultValue="<empty>"] - default value to use when missing data
 * @property {String} [quote='"'] - quote around cell values and column names
 * @property {String} [doubleQuote='""'] - the value to replace double quote in strings
 * @property {String} [delimiter=","] - delimiter of columns
 * @property {String} [eol=''] - overrides the default OS line ending (\n on Unix \r\n on Windows)
 * @property {Boolean} [excelStrings] - converts string data into normalized Excel style data
 * @property {Boolean} [header=true] - determines whether or not CSV file will contain a title column
 * @property {Boolean} [includeEmptyRows=false] - includes empty rows
 * @property {Boolean} [withBOM=false] - includes BOM character at the beginning of the csv
 */

/**
 * Main function that converts json to csv.
 *
 * @param {Array} data Array of JSON objects to be converted to CSV
 * @param {Json2CsvParams} params parameters containing data and
 * and options to configure how that data is processed.
 * @returns {String} The CSV formated data as a string
 */
module.exports = function (data, params) {
  const processedParams = preprocessParams(params);
  const processedData = preprocessData(data, processedParams);

  if (!processedParams.fields) {
    const dataFields = Array.prototype.concat.apply([],
      processedData.map(item => Object.keys(item))
    );
    processedParams.fields = dataFields
      .filter((field, pos, arr) => arr.indexOf(field) == pos);
  }

  const header = processedParams.header ? processHeaders(processedParams) : '';
  const rows = processData(processedData, processedParams);
  const csv = (processedParams.withBOM ? '\ufeff' : '')
    + header
    + ((header && rows) ? processedParams.eol : '')
    + rows;

  return csv;
};

/**
 * Check passing params and set defaults.
 *
 * @param {Array|Object} data Array or object to be converted to CSV
 * @param {Json2CsvParams} params Function parameters containing fields,
 * delimiter, default value, mark quote and header 
 */
function preprocessParams(params) {
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
 * Preprocess the data according to the give params (unwind, flatten, etc.)
  and calculate the fields and field names if they are not provided.
 *
 * @param {Array|Object} data Array or object to be converted to CSV
 * @param {Json2CsvParams} params Function parameters containing fields,
 * delimiter, default value, mark quote and header 
 */
function preprocessData(data, params) {
  // if data is an Object, not in array [{}], then just create 1 item array.
  // So from now all data in array of object format.
  let processedData = Array.isArray(data) ? data : [data];

  // Set params.fields default to first data element's keys
  if (processedData.length === 0 || typeof processedData[0] !== 'object') {
    throw new Error('params should include "fields" and/or non-empty "data" array of objects');
  }

  processedData = Array.prototype.concat.apply([],
    processedData.map(row => preprocessRow(row, params))
  );

  return processedData;
}

/**
 * Preprocess each object according to the give params (unwind, flatten, etc.).
 *
 * @param {Object} row JSON object to be converted in a CSV row
 * @param {Json2CsvParams} params Function parameters containing fields,
 * delimiter, default value, mark quote and header 
 */
function preprocessRow(row, params) {
  const processedRow = (params.unwind && params.unwind.length)
    ? unwindData(row, params.unwind)
    : [row];
  if (params.flatten) {
    return processedRow.map(flatten);
  }

  return processedRow;
}

/**
 * Create the title row with all the provided fields as column headings
 *
 * @param {Json2CsvParams} params Function parameters containing data, fields and delimiter
 * @returns {String} titles as a string
 */
function processHeaders(params) {
  return params.fields
    .map((field) =>
      (typeof field === 'string')
        ? field
        : (field.label || field.value)
    ).map(header => JSON.stringify(header).replace(/"/g, params.quote))
    .join(params.delimiter);
}

/**
 * Create the content row by row below the headers
 *
 * @param {Array} data Array of JSON objects to be converted to CSV
 * @param {Object} params Function parameters
 * @returns {String} CSV string (body)
 */
function processData(data, params) {
  return data
    .map(row => processRow(row, params))
    .filter(row => row) // Filter empty rows
    .join(params.eol);
}

/**
 * Create the content of a specific CSV row
 *
 * @param {Object} row JSON object to be converted in a CSV row
 * @param {Object} params Function parameters
 * @returns {String} CSV string (row)
 */
function processRow(row, params) {
  if (!row || (Object.getOwnPropertyNames(row).length === 0 && !params.includeEmptyRows)) {
    return undefined;
  }

  return params.fields
    .map(fieldInfo => processField(row, fieldInfo, params))
    .join(params.delimiter);
}

/**
 * Create the content of a specfic CSV row cell
 *
 * @param {Object} row JSON object representing the  CSV row that the cell belongs to
 * @param {Object} fieldInfo Details of the field to process to be a CSV cell
 * @param {Object} params Function parameters
 * @returns {String} CSV string (cell)
 */
function processField(row, fieldInfo, params) {
  const isFieldInfoObject = typeof fieldInfo === 'object';
  const defaultValue = isFieldInfoObject && 'default' in fieldInfo
    ? fieldInfo.default
    : params.defaultValue;
  const stringify = isFieldInfoObject && fieldInfo.stringify !== undefined
    ? fieldInfo.stringify
    : true;
  
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

  value = (value === null || value === undefined)
    ? defaultValue
    : value;

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
    .replace(/^"(.*)"$/, params.quote + '$1' + params.quote)
    .replace(/(\\")(?=.)/g, params.doubleQuote)
    .replace(/\\\\/g, '\\');

  if (params.excelStrings && typeof value === 'string') {
    stringifiedValue = '"="' + stringifiedValue + '""';
  }

  return stringifiedValue;
}

/**
 * Performs the unwind recursively in specified sequence
 *
 * @param {Array} dataRow Original JSON object
 * @param {String[]} unwindPaths The params.unwind value. Unwind strings to be used to deconstruct array
 * @returns {Array} Array of objects containing all rows after unwind of chosen paths
 */
function unwindData(dataRow, unwindPaths) {
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
