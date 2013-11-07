
/**
 * Module dependencies.
 */
var os = require('os');
var async = require('async');

/**
 * Main function that converts json to csv
 *
 * @param {Object} params Function parameters containing data, fields,
 * delimiter (default is ',') and hasCSVColumnTitle (default is true)
 * @param {Function} callback(err, csv) - Callback function
 *   if error, returning error in call back.
 *   if csv is created successfully, returning csv output to callback.
 */
module.exports = function(params, callback) {
  checkParams(params, function(err) {
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
 * get type of the passing variable
 * for more detail see http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
 *
 * @param {Object} any variable to get type 

 */
var typeOf = function(obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

/**
 * Check passing params
 *
 * @param {Object} params Function parameters containing data, fields,
 * delimiter and hasCSVColumnTitle 
 * @param {Function} callback Callback function returning error when invalid field is found
 */
var checkParams = function(params, callback) {
  
  //#check params.data
  params.data = JSON.parse(JSON.stringify(params.data));
  
  // if data is an Object, not in array [{}], then just create 1 item array.
  // So from now all data in array of object format.
	if(typeOf(params.data) != 'array'){
		var ar = new Array();
		ar[0]=params.data;
		params.data = ar;
	}
  
  //#check delimiter
  params.del = params.del || ',';
  
  //#check hasCSVColumnTitle, if it is not explicitly set to false then true. 
  if(!params.hasCSVColumnTitle === false){
		params.hasCSVColumnTitle = true;
	}
};

/**
 * Create the title row with all the provided fields as column headings
 *
 * @param {Object} params Function parameters containing data, fields and delimiter
 * @param {Function} callback Callback function returning error and title row as a string
 */
var createColumnTitles = function(params, callback) {
  var str = '';
  
  if (params.fieldNames && params.fieldNames.length !== params.fields.length) {
    callback(new Error('fieldNames and fields should be of the same length, if fieldNames is provided.'));
  }
  
  var fieldNames = params.fieldNames || params.fields;
  
  //if CSV has column title, then create it
  if(params.hasCSVColumnTitle) {
    fieldNames.forEach(function(element) {
      if (str !== '') {
        str += params.del;
      }
      str += JSON.stringify(element);
    });
  }
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
  params.data.forEach(function(data_element) {
    var line = '';
    params.fields.forEach(function(field_element) {
      if (line !== '') {
        line += params.del;;
      }
      var fieldValue = data_element[field_element]; 
      if (data_element.hasOwnProperty(field_element)) {
        line += JSON.stringify(data_element[field_element]);
      }
    });
    line = line.replace(/\\"/g, '""');
    str += os.EOL + line;
  });
  callback(str);
};