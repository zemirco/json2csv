/**
 * Module dependencies.
 */
var os = require('os');
var get = require('lodash.get');

/**
 * Main function that converts json to csv
 *
 * @param {Object} params Function parameters containing data, fields,
 * delimiter (default is ',') and hasCSVColumnTitle (default is true)
 * @param {Function} callback(err, csv) - Callback function
 *   if error, returning error in call back.
 *   if csv is created successfully, returning csv output to callback.
 */
module.exports = function (params, callback) {
  if (!callback || typeof callback !== 'function') {
    throw new Error('Callback is required');
  }

  checkParams(params, function (err) {
    if (err) {
      return callback(err);
    }

    var titles = createColumnTitles(params);
    var csv = createColumnContent(params, titles);

    callback(null, csv);
  });
};


/**
 * Check passing params
 *
 * @param {Object} params Function parameters containing data, fields,
 * delimiter, mark quotes and hasCSVColumnTitle
 * @param {Function} callback Callback function returning error when invalid field is found
 */
function checkParams(params, callback) {
  // if data is an Object, not in array [{}], then just create 1 item array.
  // So from now all data in array of object format.
  if (!Array.isArray(params.data)) {
    var ar = [];
    ar[0] = params.data;
    params.data = ar;
  }

  if (!params.fields && params.data && params.data.length) {
    params.fields = Object.keys(params.data[0]);
  }

  //#check fieldNames
  if (params.fieldNames && params.fieldNames.length !== params.fields.length) {
    return callback(new Error('fieldNames and fields should be of the same length, if fieldNames is provided.'));
  }

  params.fieldNames = params.fieldNames || params.fields;

  //#check delimiter
  params.del = params.del || ',';

  //#check end of line character
  params.eol = params.eol || '';

  //#check quotation mark
  params.quotes = typeof params.quotes === 'string' ? params.quotes : '"';

  //#check nested option
  params.nested = params.nested || false;

  //#check hasCSVColumnTitle, if it is not explicitly set to false then true.
  if (params.hasCSVColumnTitle !== false) {
    params.hasCSVColumnTitle = true;
  }

  callback(null);
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
    //if null or empty object do nothing
    if (dataElement && Object.getOwnPropertyNames(dataElement).length > 0) {
      var line = '';
      var eol = os.EOL || '\n';

      params.fields.forEach(function (fieldElement) {
        var val;

        if (params.nested) {
          val = get(dataElement, fieldElement, '');
        } else {
          val = dataElement[fieldElement];
        }

        if (val !== undefined) {
          var stringifiedElement = JSON.stringify(val);

          if (params.quotes !== '"') {
            stringifiedElement = replaceQuotationMarks(stringifiedElement, params.quotes);
          }

          line += stringifiedElement;
        }

        line += params.del;
      });

      //remove last delimeter
      line = line.substring(0, line.length - 1);
      line = line.replace(/\\"/g, Array(3).join(params.quotes));
debugger;
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
