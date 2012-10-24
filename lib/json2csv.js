var os = require('os');

module.exports = function(params, callback) {
  params.data = JSON.parse(JSON.stringify(params.data));
  if (checkFields(params)) {
    createColumnTitles(params.fields, function(title) {
      createColumnContent(params, title, function(csv) {
        callback(csv);
      });
    });
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

var createColumnTitles = function(fields, callback) {
  var str = '';
  fields.forEach(function(element) {
    if (str !== '') {
      str += ',';
    }
    str += element;
  });
  callback(str);
};

var createColumnContent = function(params, str, callback) {
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
  callback(str);
};