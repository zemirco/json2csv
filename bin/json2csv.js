#!/usr/bin/env node

'use strict';

const { promisify } = require('util');
const { createReadStream, createWriteStream, readFile: readFileOrig, writeFile: writeFileOrig } = require('fs');
const os = require('os');
const { isAbsolute, join } = require('path');
const program = require('commander');
const pkg = require('../package');
const json2csv = require('../lib/json2csv');
const parseNdJson = require('./utils/parseNdjson');
const TablePrinter = require('./utils/TablePrinter');

const readFile = promisify(readFileOrig);
const writeFile = promisify(writeFileOrig);

const { unwind, flatten } = json2csv.transforms;
const JSON2CSVParser = json2csv.Parser;
const Json2csvTransform = json2csv.Transform;

program
  .version(pkg.version)
  .option('-i, --input <input>', 'Path and name of the incoming json file. Defaults to stdin.')
  .option('-o, --output <output>', 'Path and name of the resulting csv file. Defaults to stdout.')
  .option('-c, --config <path>', 'Specify a file with a valid JSON configuration.')
  .option('-n, --ndjson', 'Treat the input as NewLine-Delimited JSON.')
  .option('-s, --no-streaming', 'Process the whole JSON array in memory instead of doing it line by line.')
  .option('-f, --fields <fields>', 'List of fields to process. Defaults to field auto-detection.')
  .option('-v, --default-value <defaultValue>', 'Default value to use for missing fields.')
  .option('-q, --quote <quote>', 'Character(s) to use as quote mark. Defaults to \'"\'.')
  .option('-Q, --escaped-quote <escapedQuote>', 'Character(s) to use as a escaped quote. Defaults to a double `quote`, \'""\'.')
  .option('-d, --delimiter <delimiter>', 'Character(s) to use as delimiter. Defaults to \',\'.', ',')
  .option('-e, --eol <eol>', 'Character(s) to use as End-of-Line for separating rows. Defaults to \'\\n\'.', os.EOL)
  .option('-E, --excel-strings','Wraps string data to force Excel to interpret it as string even if it contains a number.')
  .option('-H, --no-header', 'Disable the column name header.')
  .option('-a, --include-empty-rows', 'Includes empty rows in the resulting CSV output.')
  .option('-b, --with-bom', 'Includes BOM character at the beginning of the CSV.')
  .option('-p, --pretty', 'Print output as a pretty table. Use only when printing to console.')
  // Built-in transforms
  .option('--unwind [paths]', 'Creates multiple rows from a single JSON document similar to MongoDB unwind.')
  .option('--unwind-blank', 'When unwinding, blank out instead of repeating data. Defaults to false.', false)
  .option('--flatten-objects', 'Flatten nested objects. Defaults to false.', false)
  .option('--flatten-arrays', 'Flatten nested arrays. Defaults to false.', false)
  .option('--flatten-separator <separator>', 'Flattened keys separator. Defaults to \'.\'.', '.')
  .parse(process.argv);

function makePathAbsolute(filePath) {
  return (filePath && !isAbsolute(filePath))
    ? join(process.cwd(), filePath)
    : filePath;
}

program.input = makePathAbsolute(program.input);
program.output = makePathAbsolute(program.output);
program.config = makePathAbsolute(program.config);

// don't fail if piped to e.g. head
/* istanbul ignore next */
process.stdout.on('error', (error) => {
  if (error.code === 'EPIPE') process.exit(1);
});

function getInputStream(inputPath) {
  if (inputPath) return createReadStream(inputPath, { encoding: 'utf8' });

  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  return process.stdin;
}

function getOutputStream(outputPath, config) {
  if (outputPath) return createWriteStream(outputPath, { encoding: 'utf8' });
  if (config.pretty) return new TablePrinter(config).writeStream();
  return process.stdout;
}

async function getInput(inputPath, ndjson) {
  if (!inputPath) return getInputFromStdin();
  if (ndjson) return parseNdJson(await readFile(inputPath, 'utf8'));
  return require(inputPath);
}

async function getInputFromStdin() {
  return new Promise((resolve, reject) => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let inputData = '';
    process.stdin.on('data', chunk => (inputData += chunk));
    /* istanbul ignore next */
    process.stdin.on('error', err => reject(new Error('Could not read from stdin', err)));
    process.stdin.on('end', () => {
      try {
        resolve(program.ndjson ? parseNdJson(inputData) : JSON.parse(inputData));
      } catch (err) {
        reject(new Error('Invalid data received from stdin', err));
      }
    });
  });
}

async function processOutput(outputPath, csv, config) {
  if (!outputPath) {
    // eslint-disable-next-line no-console
    config.pretty ? (new TablePrinter(config)).printCSV(csv) : console.log(csv);
    return;
  }

  await writeFile(outputPath, csv);
}

async function processInMemory(config, opts) {
  const input = await getInput(program.input, config.ndjson);
  const output = new JSON2CSVParser(opts).parse(input);
  await processOutput(program.output, output, config);
}

async function processStream(config, opts) {
  const input = getInputStream(program.input);
  const transform = new Json2csvTransform(opts);
  const output = getOutputStream(program.output, config);

  await new Promise((resolve, reject) => {
    input.pipe(transform).pipe(output);
    input.on('error', reject);
    transform.on('error', reject);
    output.on('error', reject)
          .on('finish', resolve);
  });
}

(async (program) => {
  try {
    const config = Object.assign({}, program.config ? require(program.config) : {}, program);

    const transforms = [];
    if (config.unwind) {
      transforms.push(unwind({
        paths: config.unwind === true ? undefined : config.unwind.split(','),
        blankOut: config.unwindBlank
      }));
    }

    if (config.flattenObjects || config.flattenArrays) {
      transforms.push(flatten({
        objects: config.flattenObjects,
        arrays: config.flattenArrays,
        separator: config.flattenSeparator
      }));
    }
    
    const opts = {
      transforms,
      fields: config.fields
        ? (Array.isArray(config.fields) ? config.fields : config.fields.split(','))
        : config.fields,
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

    await (config.streaming ? processStream : processInMemory)(config, opts);
  } catch(err) {
    let processedError = err;
    if (program.input && err.message.includes(program.input)) {
      processedError = new Error(`Invalid input file. (${err.message})`);
    } else if (program.output && err.message.includes(program.output)) {
      processedError = new Error(`Invalid output file. (${err.message})`);
    } else if (program.config && err.message.includes(program.config)) {
      processedError = new Error(`Invalid config file. (${err.message})`);
    }
    // eslint-disable-next-line no-console
    console.error(processedError);
    process.exit(1);
  }
})(program);
