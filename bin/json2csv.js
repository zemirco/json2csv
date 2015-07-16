#!/usr/bin/env node

var fs = require('fs');
var os = require('os');
var path = require('path');
var debug = require('debug')('json2csv:cli');
var program = require('commander');
var Table = require('cli-table');
var json2csv = require('../lib/json2csv');
var pkg = require('../package');

program
  .version(pkg.version)
  .option('-i, --input <input>', 'Path and name of the incoming json file.')
  .option('-o, --output [output]', 'Path and name of the resulting csv file. Defaults to console.')
  .option('-f, --fields <fields>', 'Specify the fields to convert.')
  .option('-l, --fieldList [list]', 'Specify a file with a list of fields to include. One field per line.')
  .option('-d, --delimiter [delimiter]', 'Specify a delimiter other than the default comma to use.')
  .option('-e, --eol [value]', 'Specify an EOL value after each row.')
  .option('-q, --quote [value]', 'Specify an alternate quote value.')
  .option('-x, --nested', 'Allow fields to be nested via dot notation, e.g. \'car.make\'.')
  .option('-n, --no-header', 'Disable the column name header')
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
  var input;

  if (program.input) {
    input = require(path.join(process.cwd(), program.input));
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
    callback(null, JSON.parse(input));
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
    opts.nested = program.nested;

    if (program.delimiter) {
      opts.del = program.delimiter;
    }

    if (program.eol) {
      opts.eol = program.eol;
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
