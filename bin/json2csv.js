#!/usr/bin/env node

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const Table = require('cli-table');
const program = require('commander');
const debug = require('debug')('json2csv:cli');
const json2csv = require('../lib/json2csv');
const parseLdJson = require('../lib/parse-ldjson');
const pkg = require('../package');

program
  .version(pkg.version)
  .option('-i, --input <input>', 'Path and name of the incoming json file. If not provided, will read from stdin.')
  .option('-o, --output [output]', 'Path and name of the resulting csv file. Defaults to stdout.')
  .option('-L, --ldjson', 'Treat the input as Line-Delimited JSON.')
  .option('-f, --fields <fields>', 'Specify the fields to convert.')
  .option('-l, --field-list [list]', 'Specify a file with a list of fields to include. One field per line.')
  .option('-u, --unwind <paths>', 'Creates multiple rows from a single JSON document similar to MongoDB unwind.')
  .option('-F, --flatten', 'Flatten nested objects')
  .option('-v, --default-value [defaultValue]', 'Specify a default value other than empty string.')
  .option('-q, --quote [value]', 'Specify an alternate quote value.')
  .option('-dq, --double-quotes [value]', 'Specify a value to replace double quote in strings')
  .option('-d, --delimiter [delimiter]', 'Specify a delimiter other than the default comma to use.')
  .option('-e, --eol [value]', 'Specify an End-of-Line value for separating rows.')
  .option('-ex, --excel-strings','Converts string data into normalized Excel style data')
  .option('-n, --no-header', 'Disable the column name header')
  .option('-a, --include-empty-rows', 'Includes empty rows in the resulting CSV output.')
  .option('-b, --with-bom', 'Includes BOM character at the beginning of the csv.')
  .option('-p, --pretty', 'Use only when printing to console. Logs output in pretty tables.')
  .parse(process.argv);

function getFields(fieldList, fields) {
  if (fieldList) {
    return new Promise((resolve, reject) => {
      fs.readFile(fieldList, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        data.replace(/\r\n|\n\r|\r|\n/g, os.EOL);
        resolve(data.split(os.EOL));
      });
    });
  }

  return Promise.resolve(fields
      ? fields.split(',')
      : undefined);
}

function getInput(input, ldjson) {
  if (input) {
    const inputPath = path.isAbsolute(input)
      ? input
      : path.join(process.cwd(), input);

    if (ldjson) {
      return new Promise((resolve, reject) => {
        fs.readFile(inputPath, 'utf8', (err, data) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(parseLdJson(data));
        });
      });
    }

    return Promise.resolve(require(inputPath));
  }

  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  let inputData = '';
  process.stdin.on('data', chunk => (inputData += chunk));
  process.stdin.on('error', err => debug('Could not read from stdin', err));
  process.stdin.on('end', () => {
    const rows = ldjson
      ? parseLdJson(inputData)
      : JSON.parse(inputData);

    return Promise.resolve(rows);
  });
}

function logPretty(csv) {
  const lines = csv.split(os.EOL);
  const table = new Table({
    head: lines[0].split(','),
    colWidths: lines[0].split('","').map(elem => elem.length * 2)
  });

  for (let i = 1; i < lines.length; i++) {
    table.push(lines[i].split(','));
  }
  return table.toString();
}

Promise.all([
  getInput(program.input, program.ldjson),
  getFields(program.fieldList, program.fields)
])
  .then((results) => {
    const input = results[0];
    const fields = results[1];

    const opts = {
      fields: fields,
      unwind: program.unwind ? program.unwind.split(',') : [],
      flatten: program.flatten,
      defaultValue: program.defaultValue,
      quote: program.quote,
      doubleQuotes: program.doubleQuotes,
      delimiter: program.delimiter,
      eol: program.eol,
      excelStrings: program.excelStrings,
      header: program.header,
      includeEmptyRows: program.includeEmptyRows,
      withBOM: program.withBom
    };

    return json2csv(input, opts);
  })
  .then((csv) => {
    if (program.output) {
      return new Promise((resolve, reject) => {
        fs.writeFile(program.output, csv, (err) => {
          if (err) {
            reject(Error('Cannot save to ' + program.output + ': ' + err));
            return;
          }

          debug(program.input + ' successfully converted to ' + program.output);
          resolve();
        });
      });
    }

    // don't fail if piped to e.g. head
    process.stdout.on('error', (error) => {
      if (error.code === 'EPIPE') {
        process.exit();
      }
    });

    // eslint-disable-next-line no-console
    console.log(program.pretty ? logPretty(csv) : csv);
  })
  // eslint-disable-next-line no-console
  .catch(console.log);
