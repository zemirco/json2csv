
/**
 * Module dependencies.
 */
var os = require('os');
var async = require('async');

/**
 * Main function that converts json to csv
 *
 * @param {Object} params Function parameters containing data, fields and delimiter
 * @param {Function} callback Callback function returning csv output
 */
module.exports = function(params, callback) {
  params.data = JSON.parse(JSON.stringify(params.data));
  checkFields(params, function(err) {
    if (err) return callback(err);
    createColumnTitles(params, function(err, title) {
      if (err) return callback(err);
      createColumnContent(params, title, function(csv) {
        callback(null, csv);
      });
    });
  });
};

/**
 * Check if all the fields are present in the json data.
 *
 * @param {Object} params Function parameters containing data, fields and delimiter 
 * @param {Function} callback Callback function returning error when invalid field is found
 */
var checkFields = function(params, callback) {
  
  // private iteration function
  var myIterator = function(item, callback) {
    if (Object.keys(params.data[0]).indexOf(item) === -1) {
      callback(new Error('Cannot find ' + item + ' as a json key'));
    } else {
      callback(null);
    }
  };
  
  // check every field if it exists in the json file
  async.each(params.fields, myIterator, function(err) {
    if (err) return callback(err);
    callback(null);
  });
};

/**
 * Create the title row with all the provided fields as column headings
 *
 * @param {Object} params Function parameters containing data, fields and delimiter
 * @param {Function} callback Callback function returning error and title row as a string
 */
var createColumnTitles = function(params, callback) {
  var del = params.del || ',';
  var str = '';
  
  if (params.fieldNames && params.fieldNames.length !== params.fields.length) {
    callback(new Error('fieldNames and fields should be of the same length, if fieldNames is provided.'));
  }
  
  var fieldNames = params.fieldNames || params.fields;
  
  fieldNames.forEach(function(element) {
    if (str !== '') {
      str += del;
    }
    str += JSON.stringify(element);
  });
  callback(null, str);
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