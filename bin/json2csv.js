#!/usr/bin/env node

var program = require('commander'),
    fs = require('fs'),
    os = require('os'),
    json2csv = require('../lib/json2csv'),
    Table = require('cli-table');

program
  .version('0.1.0')
  .option('-i, --input <input>', 'Path and name of the incoming json file.')
  .option('-o, --output <output>', 'Path and name of the resulting csv file. Defaults to console.')
  .option('-f, --fields [fields]', 'Specify the fields to convert.')
  .option('-l, --fieldList <list>', 'Specify a file with a list of fields to include. One field per line.')
  .option('-p, --pretty', 'Use only when printing to console. Logs output in pretty tables.')
  .parse(process.argv);

if(!program.fields && !program.fieldList) throw new Error('Please specify fields with -f or a list of fields with -l. See json2csv --help');
if(!program.input) throw new Error('Please select a json file with -i as input. See json2csv --help');
var input = require(program.input);

var getFields = function(callback) {
  if (program.fieldList) {
    fs.readFile(program.fieldList, 'utf8', function(err, data) {
      if (err) callback(err);
      data.replace(/\r\n|\n\r|\r|\n/g, os.EOL);
      fields = data.split(os.EOL);
      callback(null, fields);
    });
  } else {
    fields = program.fields.split(',');
    callback(null, fields);
  }
};

var logPretty = function(csv, callback){
  var lines = csv.split(os.EOL);
  var table = new Table({
    head: lines[0].split(','),
    colWidths: lines[0].split(',').map(function(elem){
      return elem.length * 2;
    })
  });
  for (var i = 1; i < lines.length; i++) {
    table.push(lines[i].split(','));
    if (i === lines.length-1) {
      callback(table.toString());
    }
  }
};

getFields(function(err, fields) {
  if (err) throw new Error('Cannot read fields from file ' + program.fieldList);
  json2csv({data: input, fields: fields}, function(csv) {
    if (program.output) {
      fs.writeFile(program.output, csv, function(err) {
        if (err) throw new Error('Cannot save to ' + program.output);
        console.log(program.input + ' successfully converted to ' + program.output);
      });
    } else {
      if(program.pretty) {
        logPretty(csv, function(res) {
          console.log(res);
        });
      } else {
        console.log(csv);
      }
    }
  });
  
});