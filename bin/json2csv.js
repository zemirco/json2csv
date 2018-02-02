#!/usr/bin/env node

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const Table = require('cli-table');
const program = require('commander');
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
  .option('-c, --fields-config <path>', 'Specify a file with a fields configuration as a JSON array.')
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

function makePathAbsolute(filePath) {
  return (filePath && !path.isAbsolute(filePath))
    ? path.join(process.cwd(), filePath)
    : filePath;
}

const inputPath = makePathAbsolute(program.input);
const outputPath = makePathAbsolute(program.output);
const fieldsConfigPath = makePathAbsolute(program.fieldsConfig);

// don't fail if piped to e.g. head
process.stdout.on('error', (error) => {
  if (error.code === 'EPIPE') {
    process.exit();
  }
});

function getFields() {
  if (fieldsConfigPath) {
    try {
      return require(fieldsConfigPath);
    } catch (e) {
      throw new Error('Invalid fields config file. (' + e.message + ')');
    }
  }

  return program.fields
      ? program.fields.split(',')
      : undefined;
}

function getInput() {
  if (!inputPath) {
    return getInputFromStdin();
  }

  if (program.ndjson) {
    return getInputFromNDJSON();
  }

  return Promise.resolve(require(inputPath));
}

function getInputFromNDJSON() {
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

function getInputFromStdin() {
  return new Promise((resolve, reject) => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let inputData = '';
    process.stdin.on('data', chunk => (inputData += chunk));
    process.stdin.on('error', err => reject(new Error('Could not read from stdin', err)));
    process.stdin.on('end', () => {
      const rows = program.ndjson
        ? parseNdJson(inputData)
        : JSON.parse(inputData);

      resolve(rows);
    });
  });
}

function logPretty(csv) {
  let lines = csv.split(os.EOL);
  const header = program.header ? lines.shift().split(',') : undefined;
  
  const table = new Table(header ? {
      head: header,
      colWidths: header.map(elem => elem.length * 2)
    } : undefined);

  lines.forEach(line => table.push(line.split(',')));

  // eslint-disable-next-line no-console
  console.log(table.toString());
}

function processOutput(csv) {
  if (!outputPath) {
    // eslint-disable-next-line no-console
    program.pretty ? logPretty(csv) : console.log(csv);
    return;
  }

  return new Promise((resolve, reject) => {
    fs.writeFile(outputPath, csv, (err) => {
      if (err) {
        reject(new Error('Cannot save to ' + program.output + ': ' + err));
        return;
      }

      resolve();
    });
  });
}

Promise.resolve()
  .then(() => {
    const opts = {
      fields: getFields(),
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

    if (!inputPath || program.streamming === false) {
      return getInput()
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

    return new Promise((resolve, reject) => {
      let csv = '';
      stream
        .on('data', chunk => (csv += chunk.toString()))
        .on('end', () => resolve(csv))
        .on('error', reject);
    }).then(logPretty);
  })
  // eslint-disable-next-line no-console
  .catch(console.log);
