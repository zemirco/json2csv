
/**
 * Module dependencies.
 */
var os = require('os');

/**
 * Main function that converts json to csv
 *
 * @param {Object} params Function parameters containing data, fields and delimiter
 * @param {Function} callback Callback function returning csv output
 */
module.exports = function(params, callback) {
  params.data = JSON.parse(JSON.stringify(params.data));
  if (checkFields(params)) {
    createColumnTitles(params, function(title) {
      createColumnContent(params, title, function(csv) {
        callback(csv);
      });
    });
  }
};

/**
 * Check if all the fields are present in the json data.
 *
 * @param {Object} params Function parameters containing data, fields and delimiter
 * @returns {Boolean} True if all the fields are present in the json file
 */
var checkFields = function(params) {
  return params.fields.every(function(element) {
    if (Object.keys(params.data[0]).indexOf(element) === -1) {
      throw new Error('Cannot find ' + element + ' as a json key');
    }
    return true;
  });
};

/**
 * Create the title row with all the provided fields as column headings
 *
 * @param {Object} params Function parameters containing data, fields and delimiter
 * @param {Function} callback Callback function returning title row as a string
 */
var createColumnTitles = function(params, callback) {
  var del = params.del || ',';
  var str = '';
  
  if (params.fieldNames && params.fieldNames.length !== params.fields.length) {
    throw new Error('fieldNames and fields should be of the same length, if fieldNames is provided.');
  }
  
  var fieldNames = params.fieldNames || params.fields;
  
  fieldNames.forEach(function(element) {
    if (str !== '') {
      str += del;
    }
    
    if (params.fieldNames) {
      str += JSON.stringify(element);
    } else {
      str += element;
    }
  });
  callback(str);
};

/**
 * Create the content column by column and row by row below the title
 *
 * @param {Object} params Function parameters containing data, fields and delimiter
 * @param {String} str Title row as a string
 * @param {Function} callback Callback function returning title row and all content rows
 */
var createColumnContent = function(params, str, callback) {
  var del = params.del || ',';
  params.data.forEach(function(data_element) {
    var line = '';
    params.fields.forEach(function(field_element) {
      if (line !== '') {
        line += del;
      }
      line += JSON.stringify(data_element[field_element]);
    });
    line = line.replace(/\\"/g, '""');
    str += os.EOL + line;
  });
  callback(str);
};