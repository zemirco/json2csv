var os = require('os');

exports.parse = function(params) {
  params.data = JSON.parse(JSON.stringify(params.data));
  if (checkFields(params)) {
    return createColumnTitles(params, createColumnContent);
  }
};
  
var checkFields = function(params) {
  return params.fields.every(function(element) {
    if (Object.keys(params.data[0]).indexOf(element) === -1) {
      throw new Error('Cannot find ' + element + ' as a json key');
    }
    return true;
  });
};

var createColumnTitles = function(params, callback) {
  var str = '';
  params.fields.forEach(function(element) {
    if (str !== '') {
      str += ',';
    }
    str += element;
  });
  return callback(params, str);
};

var createColumnContent = function(params, str) {
  params.data.forEach(function(data_element) {
    var line = '';
    params.fields.forEach(function(field_element) {
      if (line !== '') {
        line += ',';
      }
      line += JSON.stringify(data_element[field_element]);
    });
    line = line.replace(/\\"/g, '""');
    str += os.EOL + line;
  });
  return str;
};