#!/usr/bin/env node

var fs = require('fs');
var os = require('os');
var path = require('path');
var Table = require('cli-table');
var program = require('commander');
var debug = require('debug')('json2csv:cli');
var json2csv = require('../lib/json2csv');
var parseLdJson = require('../lib/parse-ldjson');
var pkg = require('../package');

program
  .version(pkg.version)
  .option('-i, --input <input>', 'Path and name of the incoming json file.')
  .option('-o, --output [output]', 'Path and name of the resulting csv file. Defaults to console.')
  .option('-f, --fields <fields>', 'Specify the fields to convert.')
  .option('-l, --fieldList [list]', 'Specify a file with a list of fields to include. One field per line.')
  .option('-d, --delimiter [delimiter]', 'Specify a delimiter other than the default comma to use.')
  .option('-v, --defaultValue [defaultValue]', 'Specify a default value other than empty string.')
  .option('-a, --defaultValues <defaultValues>', 'Specify a (typed) default value for each other than empty string.')
  .option('-e, --eol [value]', 'Specify an EOL value after each row.')
  .option('-z, --newLine [value]', 'Specify an new line value for separating rows.')
  .option('-q, --quote [value]', 'Specify an alternate quote value.')
  .option('-n, --no-header', 'Disable the column name header')
  .option('-L, --ldjson', 'Treat the input as Line-Delimited JSON.')
  .option('-p, --pretty', 'Use only when printing to console. Logs output in pretty tables.')
  .parse(process.argv);

function getFields(callback) {
  var fields;

  if (program.fieldList) {
    fs.readFile(program.fieldList, 'utf8', function (err, data) {
      if (err) {
        return callback(err);
      }

      data.replace(/\r\n|\n\r|\r|\n/g, os.EOL);
      fields = data.split(os.EOL);
      callback(null, fields);
    });
  } else {
    fields = program.fields ? program.fields.split(',') : undefined;
    callback(null, fields);
  }
}

function getInput(callback) {
  var input, isAbsolute, rows;

  if (program.input) {
    isAbsolute = path.isAbsolute(program.input);
    input = require(isAbsolute ? program.input : path.join(process.cwd(), program.input));

    return callback(null, input);
  }

  input = '';
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', function (chunk) {
    input += chunk;
  });
  process.stdin.on('error', function (err) {
    debug('Could not read from stdin', err);
  });
  process.stdin.on('end', function () {
    if (program.ldjson) {
      rows = parseLdJson(input);
    } else {
      rows = JSON.parse(input);
    }

    callback(null, rows);
  });
}

function logPretty(csv, callback) {
  var lines = csv.split(os.EOL);
  var table = new Table({
    head: lines[0].split(','),
    colWidths: lines[0].split('","').map(function (elem) {
      return elem.length * 2;
    })
  });

  for (var i = 1; i < lines.length; i++) {
    table.push(lines[i].split('","'));

    if (i === lines.length - 1) {
      callback(table.toString());
    }
  }
}

getFields(function (err, fields) {
  if (err) {
    throw new Error('Cannot read fields from file ' + program.fieldList);
  }

  getInput(function (inputError, input) {
    if (inputError) {
      throw new Error('Couldn\'t get the input: ' + inputError);
    }

    var opts = {
      data: input,
      fields: fields
    };

    opts.hasCSVColumnTitle = program.header;
    opts.quotes = program.quote;
    opts.defaultValue = program.defaultValue;
    if (program.defaultValues) {
      opts.defaultValues = program.defaultValues.split(',');
      opts.defaultValues.forEach( function (val, index) {
        try {
          opts.defaultValues[index] = JSON.parse(val);
        } catch(_) {
          opts.defaultValues[index] = val;
        }
      });
    }

    if (program.delimiter) {
      opts.del = program.delimiter;
    }

    if (program.eol) {
      opts.eol = program.eol;
    }

    if (program.newLine) {
      opts.newLine = program.newLine;
    }

    json2csv(opts, function (csvError, csv) {
      if (csvError) {
        debug(csvError);
      }

      if (program.output) {
        fs.writeFile(program.output, csv, function (writeError) {
          if (writeError) {
            throw new Error('Cannot save to ' + program.output + ': ' + writeError);
          }

          debug(program.input + ' successfully converted to ' + program.output);
        });
      } else {
        /*eslint-disable no-console */
        if (program.pretty) {
          logPretty(csv, function (res) {
            console.log(res);
          });
        } else {
          console.log(csv);
        }
        /*eslint-enable no-console */
      }
    });
  });
});
