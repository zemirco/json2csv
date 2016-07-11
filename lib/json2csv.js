/**
 * Module dependencies.
 */
var os = require('os');
var lodashGet = require('lodash.get');
var lodashFlatten = require('lodash.flatten');
var lodashUniq = require('lodash.uniq');
var flatten = require('flat');

/**
 * Main function that converts json to csv.
 *
 * @param {Object} params Function parameters containing data, fields,
 * delimiter (default is ','), hasCSVColumnTitle (default is true)
 * and default value (default is '')
 * @param {Function} [callback] Callback function
 *   if error, returning error in call back.
 *   if csv is created successfully, returning csv output to callback.
 */
module.exports = function (params, callback) {
  var hasCallback = typeof callback === 'function';
  var err;

  try {
    checkParams(params);
  } catch (err) {
    if (hasCallback) {
      return process.nextTick(function () {
        callback(err);
      });
    } else {
      throw err;
    }
  }

  var titles = createColumnTitles(params);
  var csv = createColumnContent(params, titles);

  if (hasCallback) {
    return process.nextTick(function () {
      callback(null, csv);
    });
  } else {
    return csv;
  }
};


/**
 * Check passing params.
 *
 * Note that this modifies params.
 *
 * @param {Object} params Function parameters containing data, fields,
 * delimiter, default value, mark quotes and hasCSVColumnTitle
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
    debugger;
  }


  //#check fieldNames
  if (params.fieldNames && params.fieldNames.length !== params.fields.length) {
    throw new Error('fieldNames and fields should be of the same length, if fieldNames is provided.');
  }

  // Get fieldNames from fields
  params.fieldNames = params.fields.map(function (field, i) {
    if (params.fieldNames && typeof field === 'string') {
      return params.fieldNames[i];
    }
    return (typeof field === 'string') ? field : (field.label || field.value);
  });

  //#check delimiter
  params.del = params.del || ',';

  //#check end of line character
  params.eol = params.eol || '';

  //#check quotation mark
  params.quotes = typeof params.quotes === 'string' ? params.quotes : '"';

  //#check double quotes
  params.doubleQuotes = typeof params.doubleQuotes === 'string' ? params.doubleQuotes : Array(3).join(params.quotes);

  //#check default value
  params.defaultValue = params.defaultValue;

  //#check hasCSVColumnTitle, if it is not explicitly set to false then true.
  params.hasCSVColumnTitle = params.hasCSVColumnTitle !== false;

  //#check include empty rows, defaults to false
  params.includeEmptyRows = params.includeEmptyRows || false;
}

/**
 * Create the title row with all the provided fields as column headings
 *
 * @param {Object} params Function parameters containing data, fields and delimiter
 * @returns {String} titles as a string
 */
function createColumnTitles(params) {
  var str = '';

  //if CSV has column title, then create it
  if (params.hasCSVColumnTitle) {
    params.fieldNames.forEach(function (element) {
      if (str !== '') {
        str += params.del;
      }
      str += JSON.stringify(element).replace(/\"/g, params.quotes);
    });
  }

  return str;
}

/**
 * Replace the quotation marks of the field element if needed (can be a not string-like item)
 *
 * @param {string} stringifiedElement The field element after JSON.stringify()
 * @param {string} quotes The params.quotes value. At this point we know that is not equal to double (")
 */
function replaceQuotationMarks(stringifiedElement, quotes) {
  var lastCharIndex = stringifiedElement.length - 1;

  //check if it's an string-like element
  if (stringifiedElement[0] === '"' && stringifiedElement[lastCharIndex] === '"') {
    //split the stringified field element because Strings are immutable
    var splitElement = stringifiedElement.split('');

    //replace the quotation marks
    splitElement[0] = quotes;
    splitElement[lastCharIndex] = quotes;

    //join again
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
  params.data.forEach(function (dataElement) {
    //if null do nothing, if empty object without includeEmptyRows do nothing
    if (dataElement && (Object.getOwnPropertyNames(dataElement).length > 0 || params.includeEmptyRows)) {
      var line = '';
      var eol = params.newLine || os.EOL || '\n';

      params.fields.forEach(function (fieldElement) {
        var val;
        var defaultValue = params.defaultValue;
        if (typeof fieldElement === 'object' && 'default' in fieldElement) {
          defaultValue = fieldElement.default;
        }

        if (fieldElement && (typeof fieldElement === 'string' || typeof fieldElement.value === 'string')) {
          var path = (typeof fieldElement === 'string') ? fieldElement : fieldElement.value;
          val = lodashGet(dataElement, path, defaultValue);
        } else if (fieldElement && typeof fieldElement.value === 'function') {
          val = fieldElement.value(dataElement);
        }

        if (val === null || val === undefined){
          val = defaultValue;
        }

        if (val !== undefined) {
          var stringifiedElement = JSON.stringify(val);

          if (typeof val === 'object') stringifiedElement = JSON.stringify(stringifiedElement);

          if (params.quotes !== '"') {
            stringifiedElement = replaceQuotationMarks(stringifiedElement, params.quotes);
          }

          //JSON.stringify('\\') results in a string with two backslash
          //characters in it. I.e. '\\\\'.
          stringifiedElement = stringifiedElement.replace(/\\\\/g, '\\');

          if (params.excelStrings && typeof val === 'string') {
            stringifiedElement = '"="' + stringifiedElement + '""';
          }

          line += stringifiedElement;
        }

        line += params.del;
      });

      //remove last delimeter
      line = line.substring(0, line.length - 1);
      //Replace single quotes with double quotes. Single quotes are preceeded by
      //a backslash. Be careful not to remove backslash content from the string.
      line = line.split('\\\\').map(function (portion) {
        return portion.replace(/\\"/g, params.doubleQuotes);
      }).join('\\\\');
      //Remove the final excess backslashes from the stringified value.
      line = line.replace(/\\\\/g, '\\');
      //If header exists, add it, otherwise, print only content
      if (str !== '') {
        str += eol + line + params.eol;
      } else {
        str = line + params.eol;
      }
    }
  });

  return str;
}
