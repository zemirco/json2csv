#!/usr/bin/env node

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const Table = require('cli-table');
const program = require('commander');
const debug = require('debug')('json2csv:cli');
const json2csv = require('../lib/json2csv');
const parseNdJson = require('../lib/parse-ndjson');
const pkg = require('../package');

const JSON2CSVParser = json2csv.Parser;
const Json2csvTransform = json2csv.Transform;

program
  .version(pkg.version)
  .option('-i, --input <input>', 'Path and name of the incoming json file. If not provided, will read from stdin.')
  .option('-o, --output [output]', 'Path and name of the resulting csv file. Defaults to stdout.')
  .option('-n, --ndjson', 'Treat the input as NewLine-Delimited JSON.')
  .option('-s, --no-streamming', 'Process the whole JSON array in memory instead of doing it line by line.')
  .option('-f, --fields <fields>', 'Specify the fields to convert.')
  .option('-l, --field-list [list]', 'Specify a file with a list of fields to include. One field per line.')
  .option('-u, --unwind <paths>', 'Creates multiple rows from a single JSON document similar to MongoDB unwind.')
  .option('-F, --flatten', 'Flatten nested objects')
  .option('-v, --default-value [defaultValue]', 'Specify a default value other than empty string.')
  .option('-q, --quote [value]', 'Specify an alternate quote value.')
  .option('-Q, --double-quotes [value]', 'Specify a value to replace double quote in strings')
  .option('-d, --delimiter [delimiter]', 'Specify a delimiter other than the default comma to use.')
  .option('-e, --eol [value]', 'Specify an End-of-Line value for separating rows.')
  .option('-E, --excel-strings','Converts string data into normalized Excel style data')
  .option('-H, --no-header', 'Disable the column name header')
  .option('-a, --include-empty-rows', 'Includes empty rows in the resulting CSV output.')
  .option('-b, --with-bom', 'Includes BOM character at the beginning of the csv.')
  .option('-p, --pretty', 'Use only when printing to console. Logs output in pretty tables.')
  .parse(process.argv);

const inputPath = (program.input && !path.isAbsolute(program.input))
  ? path.join(process.cwd(), program.input)
  : program.input;

const outputPath = (program.output && !path.isAbsolute(program.output))
  ? path.join(process.cwd(), program.output)
  : program.output;

// don't fail if piped to e.g. head
process.stdout.on('error', (error) => {
  if (error.code === 'EPIPE') {
    process.exit();
  }
});

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

function getInput(input, ndjson) {
  if (inputPath) {
    if (ndjson) {
      return new Promise((resolve, reject) => {
        fs.readFile(inputPath, 'utf8', (err, data) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(parseNdJson(data));
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
    const rows = ndjson
      ? parseNdJson(inputData)
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

function processOutput(csv) {
  if (outputPath) {
    return new Promise((resolve, reject) => {
      fs.writeFile(outputPath, csv, (err) => {
        if (err) {
          reject(new Error('Cannot save to ' + program.output + ': ' + err));
          return;
        }

        debug(program.input + ' successfully converted to ' + program.output);
        resolve();
      });
    });
  }

  // eslint-disable-next-line no-console
  console.log(program.pretty ? logPretty(csv) : csv);
}

getFields(program.fieldList, program.fields)
  .then((fields) => {
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

    if (program.streamming === false) {
      return getInput(program.input, program.ndjson)
        .then(input => new JSON2CSVParser(opts).parse(input))
        .then(processOutput);
    }

    const transform = new Json2csvTransform(opts);
    const input = fs.createReadStream(inputPath, { encoding: 'utf8' });
    const stream = input.pipe(transform);
    
    if (program.output) {
      const output = fs.createWriteStream(outputPath, { encoding: 'utf8' });
      const outputStream = stream.pipe(output);
      return new Promise((resolve, reject) => {
        outputStream.on('finish', () => resolve()); // not sure why you want to pass a boolean
        outputStream.on('error', reject); // don't forget this!
      });
    }

    if (!program.pretty) {
      const output = stream.pipe(process.stdout);
      return new Promise((resolve, reject) => {
        output.on('finish', () => resolve()); // not sure why you want to pass a boolean
        output.on('error', reject); // don't forget this!
      });
    }

    let csv = '';
    return new Promise((resolve, reject) => {
      stream
        .on('data', chunk => (csv += chunk.toString()))
        .on('end', () => resolve(csv))
        .on('error', reject);
    })
      // eslint-disable-next-line no-console
      .then(() => console.log(logPretty(csv)));
  })
  // eslint-disable-next-line no-console
  .catch(console.log);
