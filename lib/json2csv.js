/**
 * Module dependencies.
 */
var os = require('os');
var lodashGet = require('lodash.get');
var lodashFlatten = require('lodash.flatten');
var lodashUniq = require('lodash.uniq');
var lodashSet = require('lodash.set');
var lodashCloneDeep = require('lodash.clonedeep');
var flatten = require('flat');

/**
 * @name Json2CsvParams
 * @typedef {Object}
 * @property {Array} data - array of JSON objects
 * @property {Array} [fields] - see documentation for details
 * @property {String} [delimiter=","] - delimiter of columns
 * @property {String} [defaultValue="<empty>"] - default value to use when missing data
 * @property {String} [quote='"'] - quote around cell values and column names
 * @property {String} [doubleQuote='""'] - the value to replace double quote in strings
 * @property {Boolean} [header=true] - determines whether or not CSV file will contain a title column
 * @property {String} [eol=''] - overrides the default OS line ending (\n on Unix \r\n on Windows)
 * @property {Boolean} [flatten=false] - flattens nested JSON using flat (https://www.npmjs.com/package/flat)
 * @property {String[]} [unwind] - similar to MongoDB's $unwind, Deconstructs an array field from the input JSON to output a row for each element
 * @property {Boolean} [excelStrings] - converts string data into normalized Excel style data
 * @property {Boolean} [includeEmptyRows=false] - includes empty rows
 * @property {Boolean} [withBOM=false] - includes BOM character at the beginning of the csv
 */

/**
 * Main function that converts json to csv.
 *
 * @param {Json2CsvParams} params parameters containing data and
 * and options to configure how that data is processed.
 * @returns {String} The CSV formated data as a string
 */
module.exports = function (params) {
  checkParams(params);

  var titles = createColumnTitles(params);
  var csv = createColumnContent(params, titles);

  return csv;
};


/**
 * Check passing params.
 *
 * Note that this modifies params.
 *
 * @param {Json2CsvParams} params Function parameters containing data, fields,
 * delimiter, default value, mark quote and header 
 */
function checkParams(params) {
  params.data = params.data || [];

  // if data is an Object, not in array [{}], then just create 1 item array.
  // So from now all data in array of object format.
  if (!Array.isArray(params.data)) {
    params.data = [params.data];
  }

  if (params.flatten) {
    params.data = params.data.map(flatten);
  }

  // Set params.fields default to first data element's keys
  if (!params.fields && (params.data.length === 0 || typeof params.data[0] !== 'object')) {
    throw new Error('params should include "fields" and/or non-empty "data" array of objects');
  }

  if (!params.fields) {
    var dataFields = params.data.map(function (item) {
      return Object.keys(item);
    });

    dataFields = lodashFlatten(dataFields);
    params.fields = lodashUniq(dataFields);
  }

  // Get fieldNames from fields
  params.fieldNames = params.fields.map(function (field) {
    return (typeof field === 'string')
      ? field
      : (field.label || field.value);
  });

  // check delimiter
  params.delimiter = params.delimiter || ',';

  // check end of line character
  params.eol = params.eol || os.EOL || '\n';

  // check quotation mark
  params.quote = typeof params.quote === 'string' ? params.quote : '"';

  // check double quote
  params.doubleQuote = typeof params.doubleQuote === 'string' ? params.doubleQuote : Array(3).join(params.quote);

  // check default value
  params.defaultValue = params.defaultValue;

  // check header, if it is not explicitly set to false then true.
  params.header = params.header !== false;

  // check include empty rows, defaults to false
  params.includeEmptyRows = params.includeEmptyRows || false;

  // check with BOM, defaults to false
  params.withBOM = params.withBOM || false;

  // check unwind, defaults to empty array
  params.unwind = params.unwind || [];

  // if unwind is not in array [{}], then just create 1 item array.
  if (!Array.isArray(params.unwind)) {
    params.unwind = [params.unwind];
  }
}

/**
 * Create the title row with all the provided fields as column headings
 *
 * @param {Json2CsvParams} params Function parameters containing data, fields and delimiter
 * @returns {String} titles as a string
 */
function createColumnTitles(params) {
  var str = '';

  // if CSV has column title, then create it
  if (params.header) {
    params.fieldNames.forEach(function (element) {
      if (str !== '') {
        str += params.delimiter;
      }
      str += JSON.stringify(element).replace(/"/g, params.quote);
    });
  }

  return str;
}

/**
 * Replace the quotation marks of the field element if needed (can be a not string-like item)
 *
 * @param {string} stringifiedElement The field element after JSON.stringify()
 * @param {string} quote The params.quote value. At this point we know that is not equal to double (")
 */
function replaceQuotationMarks(stringifiedElement, quote) {
  var lastCharIndex = stringifiedElement.length - 1;

  // check if it's an string-like element
  if (stringifiedElement[0] === '"' && stringifiedElement[lastCharIndex] === '"') {
    // split the stringified field element because Strings are immutable
    var splitElement = stringifiedElement.split('');

    // replace the quotation marks
    splitElement[0] = quote;
    splitElement[lastCharIndex] = quote;

    // join again
    stringifiedElement = splitElement.join('');
  }

  return stringifiedElement;
}

/**
 * Create the content column by column and row by row below the title
 *
 * @param {Object} params Function parameters containing data, fields and delimiter
 * @param {String} str Title row as a string
 * @returns {String} csv string
 */
function createColumnContent(params, str) {
  createDataRows(params.data, params.unwind).forEach(function (dataElement) {
    // if null do nothing, if empty object without includeEmptyRows do nothing
    if (dataElement && (Object.getOwnPropertyNames(dataElement).length > 0 || params.includeEmptyRows)) {
      var line = '';

      params.fields.forEach(function (fieldElement) {
        var val;
        var defaultValue = params.defaultValue;
        var stringify = true;
        if (typeof fieldElement === 'object' && 'default' in fieldElement) {
          defaultValue = fieldElement.default;
        }

        if (fieldElement && (typeof fieldElement === 'string' || typeof fieldElement.value === 'string')) {
          var path = (typeof fieldElement === 'string') ? fieldElement : fieldElement.value;
          val = lodashGet(dataElement, path, defaultValue);
        } else if (fieldElement && typeof fieldElement.value === 'function') {
          var field = {
            label: fieldElement.label,
            default: fieldElement.default
          };
          val = fieldElement.value(dataElement, field, params.data);
          if (fieldElement.stringify !== undefined) {
            stringify = fieldElement.stringify;
          }
        }

        if (val === null || val === undefined){
          val = defaultValue;
        }

        if (val !== undefined) {
          if (params.preserveNewLinesInValues && typeof val === 'string') {
            val = val
              .replace(/\n/g, '\u2028')
              .replace(/\r/g, '\u2029');
          }

          var stringifiedElement = val;
          if (stringify) {
            stringifiedElement = JSON.stringify(val);
          }

          if (stringifiedElement !== undefined) {
            if (params.preserveNewLinesInValues && typeof val === 'string') {
              stringifiedElement = stringifiedElement
                .replace(/\u2028/g, '\n')
                .replace(/\u2029/g, '\r');
            }

            if (typeof val === 'object') {
              // In some cases (e.g. val is a Date), stringifiedElement is already a quoted string.
              // Strip the leading and trailing quote if so, so we don't end up double-quoting it
              stringifiedElement = replaceQuotationMarks(stringifiedElement, '');

              // If val is a normal object, we want to escape its JSON so any commas etc
              // don't get interpreted as field separators
              stringifiedElement = JSON.stringify(stringifiedElement);
            }

            if (params.quote !== '"') {
              stringifiedElement = replaceQuotationMarks(stringifiedElement, params.quote);
            }

            // JSON.stringify('\\') results in a string with two backslash
            // characters in it. I.e. '\\\\'.
            stringifiedElement = stringifiedElement.replace(/\\\\/g, '\\');

            if (params.excelStrings && typeof val === 'string') {
              stringifiedElement = '"="' + stringifiedElement + '""';
            }

            // Replace single quote with double quote.  Single quote are preceeded by
            // a backslash,  and it's not at the end of the stringifiedElement.
            stringifiedElement = stringifiedElement.replace(/(\\")(?=.)/g, params.doubleQuote);

            line += stringifiedElement;
          }
        }

        line += params.delimiter;
      });

      // remove last delimeter by its length
      line = line.substring(0, line.length - params.delimiter.length);

      // If header exists, add it, otherwise, print only content
      if (str !== '') {
        str += params.eol + line;
      } else {
        str = line;
      }
    }
  });
  
  // Add BOM character if required
  if (params.withBOM) {
    str = '\ufeff' + str;
  }

  return str;
}

/**
 * Performs the unwind recursively in specified sequence
 *
 * @param {Array} originalData The params.data value. Original array of JSON objects
 * @param {String[]} unwindPaths The params.unwind value. Unwind strings to be used to deconstruct array
 * @returns {Array} Array of objects containing all rows after unwind of chosen paths
 */
function createDataRows(originalData, unwindPaths) {
  var dataRows = [];
  
  if (unwindPaths.length) {
    originalData.forEach(function (dataElement) {
      var dataRow = [dataElement];

      unwindPaths.forEach(function (unwind) {
        dataRow = unwindRows(dataRow, unwind);
      });

      Array.prototype.push.apply(dataRows, dataRow);
    });
  } else {
    dataRows = originalData;
  }

  return dataRows;
}

/**
 * Performs the unwind logic if necessary to convert single JSON document into multiple rows
 *
 * @param {Array} inputRows Array contaning single or multiple rows to unwind
 * @param {String} unwind Single path to do unwind
 * @returns {Array} Array of rows processed
 */
function unwindRows(inputRows, unwind) {
  var outputRows = [];
  
  inputRows.forEach(function (dataEl) {
    var unwindArray = lodashGet(dataEl, unwind);
    var isArr = Array.isArray(unwindArray);

    if (isArr && unwindArray.length) {
      unwindArray.forEach(function (unwindEl) {
        var dataCopy = lodashCloneDeep(dataEl);
        lodashSet(dataCopy, unwind, unwindEl);
        outputRows.push(dataCopy);
      });
    } else if (isArr && !unwindArray.length) {
      var dataCopy = lodashCloneDeep(dataEl);
      lodashSet(dataCopy, unwind, undefined);
      outputRows.push(dataCopy);
    } else {
      outputRows.push(dataEl);
    }
  });
  return outputRows;
}
