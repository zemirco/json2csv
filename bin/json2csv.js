#!/usr/bin/env node

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const program = require('commander');
const pkg = require('../package');
const json2csv = require('../lib/json2csv');
const parseNdJson = require('./utils/parseNdjson');
const TablePrinter = require('./utils/TablePrinter');

const JSON2CSVParser = json2csv.Parser;
const Json2csvTransform = json2csv.Transform;

program
  .version(pkg.version)
  .option('-i, --input <input>', 'Path and name of the incoming json file. Defaults to stdin.')
  .option('-o, --output [output]', 'Path and name of the resulting csv file. Defaults to stdout.')
  .option('-c, --config <path>', 'Specify a file with a valid JSON configuration.')
  .option('-n, --ndjson', 'Treat the input as NewLine-Delimited JSON.')
  .option('-s, --no-streaming', 'Process the whole JSON array in memory instead of doing it line by line.')
  .option('-f, --fields <fields>', 'List of fields to process. Defaults to field auto-detection.')
  .option('-u, --unwind <paths>', 'Creates multiple rows from a single JSON document similar to MongoDB unwind.')
  .option('-B, --unwind-blank', 'When unwinding, blank out instead of repeating data.')
  .option('-F, --flatten', 'Flatten nested objects.')
  .option('-S, --flatten-separator <separator>', 'Flattened keys separator. Defaults to \'.\'.')
  .option('-v, --default-value [defaultValue]', 'Default value to use for missing fields.')
  .option('-q, --quote [quote]', 'Character(s) to use as quote mark. Defaults to \'"\'.')
  .option('-Q, --escaped-quote [escapedQuote]', 'Character(s) to use as a escaped quote. Defaults to a double `quote`, \'""\'.')
  .option('-d, --delimiter [delimiter]', 'Character(s) to use as delimiter. Defaults to \',\'.')
  .option('-e, --eol [eol]', 'Character(s) to use as End-of-Line for separating rows. Defaults to \'\\n\'.')
  .option('-E, --excel-strings','Wraps string data to force Excel to interpret it as string even if it contains a number.')
  .option('-H, --no-header', 'Disable the column name header.')
  .option('-a, --include-empty-rows', 'Includes empty rows in the resulting CSV output.')
  .option('-b, --with-bom', 'Includes BOM character at the beginning of the CSV.')
  .option('-p, --pretty', 'Print output as a pretty table. Use only when printing to console.')
  .parse(process.argv);

function makePathAbsolute(filePath) {
  return (filePath && !path.isAbsolute(filePath))
    ? path.join(process.cwd(), filePath)
    : filePath;
}

const inputPath = makePathAbsolute(program.input);
const outputPath = makePathAbsolute(program.output);
const configPath = makePathAbsolute(program.config);

if (program.fields) program.fields = program.fields.split(',');
if (program.unwind) program.unwind = program.unwind.split(',');
program.delimiter = program.delimiter || ',';
program.eol = program.eol || os.EOL;

// don't fail if piped to e.g. head
/* istanbul ignore next */
process.stdout.on('error', (error) => {
  if (error.code === 'EPIPE') {
    process.exit(1);
  }
});

function getConfigFromFile() {
  return configPath
    ? require(configPath)
    : {};
}

function getInputStream() {
  if (!inputPath) {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    return process.stdin;
  }

  return fs.createReadStream(inputPath, { encoding: 'utf8' })
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
    const config = Object.assign({}, getConfigFromFile(), program);
    
    const opts = {
      fields: config.fields,
      unwind: config.unwind,
      unwindBlank: config.unwindBlank,
      flatten: config.flatten,
      flattenSeparator: config.flattenSeparator,
      defaultValue: config.defaultValue,
      quote: config.quote,
      escapedQuote: config.escapedQuote,
      delimiter: config.delimiter,
      eol: config.eol,
      excelStrings: config.excelStrings,
      header: config.header,
      includeEmptyRows: config.includeEmptyRows,
      withBOM: config.withBom
    };

    if (!config.streaming) {
      return getInput(config.ndjson)
        .then(input => new JSON2CSVParser(opts).parse(input))
        .then(processOutput);
    }

    const transform = new Json2csvTransform(opts);
    const input = getInputStream();
    const stream = input.pipe(transform);
    
    if (config.output) {
      const outputStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });
      const output = stream.pipe(outputStream);
      return new Promise((resolve, reject) => {
        input.on('error', reject);
        outputStream.on('error', reject);
        output.on('error', reject);
        output.on('finish', () => resolve());
      });
    }

    if (!config.pretty) {
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
      const table = new TablePrinter(config);
      stream
        .on('data', chunk => {
          csv += chunk.toString();
          const index = csv.lastIndexOf(config.eol);
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
    if (inputPath && err.message.includes(inputPath)) {
      err = new Error('Invalid input file. (' + err.message + ')');
    } else if (outputPath && err.message.includes(outputPath)) {
      err = new Error('Invalid output file. (' + err.message + ')');
    } else if (configPath && err.message.indexOf(configPath) !== -1) {
      err = new Error('Invalid config file. (' + err.message + ')');
    }
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
