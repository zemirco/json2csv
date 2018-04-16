#!/usr/bin/env node

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const program = require('commander');
const json2csv = require('../lib/json2csv');
const parseNdJson = require('./utils/parseNdjson');
const TablePrinter = require('./utils/TablePrinter');
const pkg = require('../package');

const JSON2CSVParser = json2csv.Parser;
const Json2csvTransform = json2csv.Transform;

program
  .version(pkg.version)
  .option('-i, --input <input>', 'Path and name of the incoming json file. If not provided, will read from stdin.')
  .option('-o, --output [output]', 'Path and name of the resulting csv file. Defaults to stdout.')
  .option('-n, --ndjson', 'Treat the input as NewLine-Delimited JSON.')
  .option('-s, --no-streaming', 'Process the whole JSON array in memory instead of doing it line by line.')
  .option('-f, --fields <fields>', 'Specify the fields to convert.')
  .option('-c, --fields-config <path>', 'Specify a file with a fields configuration as a JSON array.')
  .option('-u, --unwind <paths>', 'Creates multiple rows from a single JSON document similar to MongoDB unwind.')
  .option('-B, --unwind-blank', 'When unwinding, blank out instead of repeating data.')
  .option('-F, --flatten', 'Flatten nested objects')
  .option('-v, --default-value [defaultValue]', 'Specify a default value other than empty string.')
  .option('-q, --quote [value]', 'Specify an alternate quote value.')
  .option('-Q, --double-quote [value]', 'Specify a value to replace double quote in strings')
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

program.delimiter = program.delimiter || ',';
program.eol = program.eol || os.EOL;

// don't fail if piped to e.g. head
/* istanbul ignore next */
process.stdout.on('error', (error) => {
  if (error.code === 'EPIPE') {
    process.exit();
  }
});

function getFields() {
  if (fieldsConfigPath) {
    return require(fieldsConfigPath);
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

  try {
    return Promise.resolve(require(inputPath));
  } catch (err) {
    return Promise.reject(err);
  }
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
    /* istanbul ignore next */
    process.stdin.on('error', err => reject(new Error('Could not read from stdin', err)));
    process.stdin.on('end', () => {
      try {
        const rows = program.ndjson
          ? parseNdJson(inputData)
          : JSON.parse(inputData);

        resolve(rows);
      } catch (err) {
        reject(new Error('Invalid data received from stdin', err));
      }
    });
  });
}

function processOutput(csv) {
  if (!outputPath) {
    // eslint-disable-next-line no-console
    program.pretty ? (new TablePrinter(program)).printCSV(csv) : console.log(csv);
    return;
  }

  return new Promise((resolve, reject) => {
    fs.writeFile(outputPath, csv, (err) => {
      if (err) {
        reject(err);
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
      unwindBlank: program.unwindBlank,
      flatten: program.flatten,
      defaultValue: program.defaultValue,
      quote: program.quote,
      doubleQuote: program.doubleQuote,
      delimiter: program.delimiter,
      eol: program.eol,
      excelStrings: program.excelStrings,
      header: program.header,
      includeEmptyRows: program.includeEmptyRows,
      withBOM: program.withBom
    };

    if (!inputPath || program.streaming === false) {
      return getInput()
        .then(input => new JSON2CSVParser(opts).parse(input))
        .then(processOutput);
    }

    const transform = new Json2csvTransform(opts);
    const input = fs.createReadStream(inputPath, { encoding: 'utf8' });
    const stream = input.pipe(transform);
    
    if (program.output) {
      const outputStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });
      const output = stream.pipe(outputStream);
      return new Promise((resolve, reject) => {
        input.on('error', reject);
        outputStream.on('error', reject);
        output.on('error', reject);
        output.on('finish', () => resolve());
      });
    }

    if (!program.pretty) {
      const output = stream.pipe(process.stdout);
      return new Promise((resolve, reject) => {
        input.on('error', reject);
        stream
          .on('finish', () => resolve())
          .on('error', reject);
        output.on('error', reject);
      });
    }

    return new Promise((resolve, reject) => {
      input.on('error', reject);
      stream.on('error', reject);
      let csv = '';
      const table = new TablePrinter(program);
      stream
        .on('data', chunk => {
          csv += chunk.toString();
          const index = csv.lastIndexOf(program.eol);
          let lines = csv.substring(0, index);
          csv = csv.substring(index + 1);

          if (lines) {
            table.push(lines);
          }

        })
        .on('end', () => {
          table.end(csv);
          resolve();
        })
        .on('error', reject);
    });
  })
  .catch((err) => {
    if (inputPath && err.message.indexOf(inputPath)  !== -1) {
      err = new Error('Invalid input file. (' + err.message + ')');
    } else if (outputPath && err.message.indexOf(outputPath) !== -1) {
      err = new Error('Invalid output file. (' + err.message + ')');
    } else if (fieldsConfigPath && err.message.indexOf(fieldsConfigPath) !== -1) {
      err = new Error('Invalid fields config file. (' + err.message + ')');
    }
    // eslint-disable-next-line no-console
    console.error(err);
  });
