# json2csv

Converts JSON into CSV with column titles and proper line endings.  
Can be used as a module and from the command line.

[![npm version][npm-badge]][npm-badge-url]
[![Build Status][travis-badge]][travis-badge-url]
[![Coverage Status][coveralls-badge]][coveralls-badge-url]

See the [CHANGELOG] for details about the latest release.

> :construction: The documentation seen here is for the upcoming v6 which is a work in progress, see https://www.npmjs.com/package/json2csv for the documentation for the latest published version.

Features

- Fast and lightweight
- Scalable to infinitely large datasets (using stream processing)
- Support for standard JSON as well as NDJSON
- Advanced data selection (automatic field discovery, underscore-like selectors, custom data getters, default values for missing fields, transforms, etc.)
- Highly customizable (supportting custom quotation marks, delimiters, eol values, etc.)
- Automatic escaping (preserving new lines, quotes, etc. in them)
- Optional headers
- Unicode encoding support
- Pretty printing in table format to stdout

## How to install

You can install json2csv as a dependency using NPM.  
Requires **Node v10** or higher.

```sh
# Global so it can be called from anywhere
$ npm install -g json2csv
# or as a dependency of a project
$ npm install json2csv --save
```

Also, if you are loading json2csv directly to the browser you can pull it directly from the CDN.

```html
<script src="https://cdn.jsdelivr.net/npm/json2csv"></script>
```

By default, the above script will get the latest release of json2csv. You can also specify a specific version:

```html
<script src="https://cdn.jsdelivr.net/npm/json2csv@4.2.1"></script>
```

## Usage

### Command Line Interface

`json2csv` can be called from the command line if installed globally (using the `-g` flag).

```bash
Usage: json2csv [options]

Options:
  -V, --version                       output the version number
  -i, --input <input>                 Path and name of the incoming json file. Defaults to stdin.
  -o, --output <output>               Path and name of the resulting csv file. Defaults to stdout.
  -c, --config <path>                 Specify a file with a valid JSON configuration.
  -n, --ndjson                        Treat the input as NewLine-Delimited JSON.
  -s, --no-streaming                  Process the whole JSON array in memory instead of doing it line by line.
  -f, --fields <fields>               List of fields to process. Defaults to field auto-detection.
  -v, --default-value <defaultValue>  Default value to use for missing fields.
  -q, --quote <quote>                 Character(s) to use as quote mark. Defaults to '"'.
  -Q, --escaped-quote <escapedQuote>  Character(s) to use as a escaped quote. Defaults to a double `quote`, '""'.
  -d, --delimiter <delimiter>         Character(s) to use as delimiter. Defaults to ','. (default: ",")
  -e, --eol <eol>                     Character(s) to use as End-of-Line for separating rows. Defaults to '\n'. (default: "\n")
  -E, --excel-strings                 Wraps string data to force Excel to interpret it as string even if it contains a number.
  -H, --no-header                     Disable the column name header.
  -a, --include-empty-rows            Includes empty rows in the resulting CSV output.
  -b, --with-bom                      Includes BOM character at the beginning of the CSV.
  -p, --pretty                        Print output as a pretty table. Use only when printing to console.
  --unwind [paths]                    Creates multiple rows from a single JSON document similar to MongoDB unwind.
  --unwind-blank                      When unwinding, blank out instead of repeating data. Defaults to false. (default: false)
  --flatten-objects                   Flatten nested objects. Defaults to false. (default: false)
  --flatten-arrays                    Flatten nested arrays. Defaults to false. (default: false)
  --flatten-separator <separator>     Flattened keys separator. Defaults to '.'. (default: ".")
  -h, --help                          output usage information
```

If no input `-i` is specified the result is expected from to the console standard input.
If no output `-o` is specified the result is printed to the console standard output.
If no fields `-f` or config `-c` are passed the fields of the first element are used since json2csv CLI process the items one at a time. You can use the `--no-streaming` flag to load the entire JSON in memory and get all the headers. However, keep in mind that this is slower and requires much more memory.
Use `-p` to show the result as a table in the console.

Any option passed through the config file `-c` will be overriden if a specific flag is passed as well. For example, the fields option of the config will be overriden if the fields flag `-f` is used.

For more details, you can check some of our CLI usage [examples](docs/cli-examples.md) or our [test suite](test/CLI.js).

## Javascript module

`json2csv` can also be use programatically from you javascript codebase.

The programatic APIs take a configuration object very similar to the CLI options. All APIs take the exact same options.

- `fields` - Array of Objects/Strings. Defaults to toplevel JSON attributes. See example below.
- `ndjson` - Boolean, indicates that the data is in NDJSON format. Only effective when using the streaming API and not in object mode.
- `transforms` - Array of transforms. A transform is a function that receives a data recod and returns a transformed record. Transforms are executed in order before converting the data record into a CSV row. See bellow for more details.
- `formatters` - Object where the each key is a Javascript data type and its associated value is a formatters for the given type. A formatter is a function that receives the raw js value of a given type and formats it as a valid CSV cell. Supported types are the types returned by `typeof` i.e. `undefined`, `boolean`, `number`, `bigint`, `string`, `symbol`, `function` and `object`.
- `defaultValue` - Default value to use when missing data. Defaults to `<empty>` if not specified. (Overridden by `fields[].default`)
- `delimiter` - String, delimiter of columns. Defaults to `,` if not specified.
- `eol` - String, overrides the default OS line ending (i.e. `\n` on Unix and `\r\n` on Windows).
- `header` - Boolean, determines whether or not CSV file will contain a title column. Defaults to `true` if not specified.
- `includeEmptyRows` - Boolean, includes empty rows. Defaults to `false`.
- `withBOM` - Boolean, with BOM character. Defaults to `false`.

### Transforms

json2csv supports transforms. A transform is a function that receives a data record and returns a transformed record.

#### Custom transforms

```js
function doNothing(item) {
  // apply tranformations or create new object
  return transformedItem;
}
```

or using ES6

```js
const doNothing = (item) => {
  // apply tranformations or create new object
  return transformedItem;
};
```

For example, let's add a line counter to our CSV, capitalize the car field and change the price to be in Ks (1000s).

```js
function addCounter() {
  let counter = 1;
  return (item) => ({
    counter: counter++,
    ...item,
    car: item.car.toUpperCase(),
    price: item.price / 1000,
  });
}
```

Then you can add `addCounter()` to the `transforms` array.
The reason to wrap the actual transform in a factory function is so the counter always starts with one and you can reuse it. But it's not strictly necessary.

#### Built-in Transforms

There is a number of built-in transform provider by the library.

```js
const {
  transforms: { unwind, flatten },
} = require('json2csv');
```

##### Unwind

The `unwind` transform deconstructs an array field from the input item to output a row for each element. It's similar to MongoDB's \$unwind aggregation.

The transform needs to be instantiated and takes an options object as arguments containing:

- `paths` - Array of Strings, list the paths to the fields to be unwound. It's mandatory and should not be empty.
- `blankOut` - Boolean, unwind using blank values instead of repeating data. Defaults to `false`.

```js
// Default
unwind({ paths: ['fieldToUnwind'] });

// Blanking out repeated data
unwind({ paths: ['fieldToUnwind'], blankOut: true });
```

##### Flatten

Flatten nested JavaScript objects into a single level object.

The transform needs to be instantiated and takes an options object as arguments containing:

- `objects` - Boolean, whether to flatten JSON objects or not. Defaults to `true`.
- `arrays`- Boolean, whether to flatten Arrays or not. Defaults to `false`.
- `separator` - String, separator to use between nested JSON keys when flattening a field. Defaults to `.`.

```js
// Default
flatten();

// Custom separator '__'
flatten({ separator: '_' });

// Flatten only arrays
flatten({ objects: false, arrays: true });
```

### Formatters

json2csv supports formatters. A formatter is a function that receives the raw js value of a given type and formats it as a valid CSV cell. Supported types are the types returned by `typeof` i.e. `undefined`, `boolean`, `number`, `bigint`, `string`, `symbol`, `function` and `object`.

There is a special type of formatter that only applies to the CSV headers if they are present. This is the `header` formatter and by default it uses the `string` formatter.

Pay special attention to the `string` formatter since other formatters like the `headers` or `object` formatters, rely on the `string` formatter for the stringification.

#### Custom Formatters

```js
function formatType(itemOfType) {
  // format object
  return formattedItem;
}
```

or using ES6

```js
const formatType = (itemOfType) => {
  // apply tranformations or create new object
  return itemOfType;
};
```

For example, let's format functions as their name or 'unknown'.

```js
const functionNameFormatter = (item) => item.name || 'unknown';
```

Then you can add `{ function: functionNameFormatter }` to the `formatters` object.

A less trivial example would be to ensure that string cells never take more than 20 characters.

```js
const stringFixedFormatter = (stringLength, ellipsis = '...') => (item) =>
  item.length <= stringLength
    ? item
    : `${item.slice(0, stringLength - ellipsis.length)}${ellipsis}`;
```

Then you can add `{ string: stringFixedFormatter(20) }` to the `formatters` object.
Or `stringFixedFormatter(20, '')` to not use the ellipsis and just clip the text.
As with the sample transform in the previous section, the reason to wrap the actual formatter in a factory function is so it can be parameterized easily.

Keep in mind that the above example doesn't quote or escape the string which is problematic. A more realistic example could use our built-in string formatted to do the quoting and escaping like:

```js
const { formatters: { string: defaultStringFormatter } } = require('json2csv');

const stringFixedFormatter = (stringLength, ellipsis = '...', stringFormatter = defaultStringFormatter()) => (item) => item.length <= stringLength ? item :  stringFormatter(`${item.slice(0, stringLength - ellipsis.length)}${ellipsis})`;
```

#### Built-in Formatters

There is a number of built-in formatters provider by the library.

```js
const {
  formatters: {
    default: defaultFormatter,
    number: numberFormatter,
    string: stringFormatter,
    stringQuoteOnlyIfNecessary: stringQuoteOnlyIfNecessaryFormatter,
    stringExcel: stringExcelFormatter,
    symbol: symbolFormatter,
    object: objectFormatter,
  },
} = require('json2csv');
```

##### Default

This formatter just relies on standard JavaScript stringification.
This is the default formatter for `undefined`, `boolean`, `number` and `bigint` elements.

It's not a factory but the formatter itself.

```js
{
  undefined: defaultFormatter,
  boolean: defaultFormatter,
  number: defaultFormatter,
  bigint: defaultFormatter,
}
```

##### Number

Format numbers with a fixed amount of decimals

The formatter needs to be instantiated and takes an options object as arguments containing:

- `separator` - String, separator to use between integer and decimal digits. Defaults to `.`. It's crucial that the decimal separator is not the same character as the CSV delimiter or the result CSV will be incorrect.
- `decimals` - Number, amount of decimals to keep. Defaults to all the available decimals.

```js
{
  // 2 decimals
  number: numberFormatter(),

  // 3 decimals
  number: numberFormatter(3)
}
```

##### String

Format strings quoting them and escaping illegal characters if needed.

The formatter needs to be instantiated and takes an options object as arguments containing:

- `quote` - String, quote around cell values and column names. Defaults to `"`.
- `escapedQuote` - String, the value to replace escaped quotes in strings. Defaults to double-quotes (for example `""`).

This is the default for `string` elements.

```js
{
  // Uses '"' as quote and '""' as escaped quote
  string: stringFormatter(),

  // Use single quotes `'` as quotes and `''` as escaped quote
  string: stringFormatter({ quote: '\'' }),

  // Never use quotes
  string: stringFormatter({ quote: '' }),

  // Use '\"' as escaped quotes
  string: stringFormatter({ escapedQuote: '\"' }),
}
```

##### String Quote Only Necessary

The default string formatter quote all strings. This is consistent but it is not mandatory according to the CSV standard. This formatter only quote strings if they don't contain quotes (by default `"`), the CSV separator character (by default `,`) or the end-of-line (by default `\n` or `\r\n` depending on you operating system).

The formatter needs to be instantiated and takes an options object as arguments containing:

- `quote` - String, quote around cell values and column names. Defaults to `"`.
- `escapedQuote` - String, the value to replace escaped quotes in strings. Defaults to 2x`quotes` (for example `""`).
- `eol` - String, overrides the default OS line ending (i.e. `\n` on Unix and `\r\n` on Windows). Ensure that you use the same `eol` here as in the json2csv options.

```js
{
  // Uses '"' as quote, '""' as escaped quote and your OS eol
  string: stringQuoteOnlyIfNecessaryFormatter(),

  // Use single quotes `'` as quotes, `''` as escaped quote and your OS eol
  string: stringQuoteOnlyIfNecessaryFormatter({ quote: '\'' }),

  // Never use quotes
  string: stringQuoteOnlyIfNecessaryFormatter({ quote: '' }),

  // Use '\"' as escaped quotes
  string: stringQuoteOnlyIfNecessaryFormatter({ escapedQuote: '\"' }),

  // Use linux EOL regardless of your OS
  string: stringQuoteOnlyIfNecessaryFormatter({ eol: '\n' }),
}
```

##### String Excel

Converts string data into normalized Excel style data after formatting it using the given string formatter.

The formatter needs to be instantiated and takes an options object as arguments containing:

- `stringFormatter` - Boolean, whether to flatten JSON objects or not. Defaults to our built-in `stringFormatter`.

```js
{
  // Uses the default string formatter
  string: stringExcelFormatter(),

  // Uses custom string formatter
  string: stringExcelFormatter(myStringFormatter()),
}
```

##### Symbol

Format the symbol as its string value and then use the given string formatter i.e. `Symbol('My Symbol')` is formatted as `"My Symbol"`.

The formatter needs to be instantiated and takes an options object as arguments containing:

- `stringFormatter` - Boolean, whether to flatten JSON objects or not. Defaults to our built-in `stringFormatter`.

This is the default for `symbol` elements.

```js
{
  // Uses the default string formatter
  symbol: symbolFormatter(),

  // Uses custom string formatter
  // You rarely need to this since the symbol formatter will use the string formatter that you set.
  symbol: symbolFormatter(myStringFormatter()),
}
```

##### Object

Format the object using `JSON.stringify` and then the given string formatter.
Some object types likes `Date` or Mongo's `ObjectId` are automatically quoted by `JSON.stringify`. This formatter, remove those quotes and uses the given string formatter for correct quoting and escaping.

The formatter needs to be instantiated and takes an options object as arguments containing:

- `stringFormatter` - Boolean, whether to flatten JSON objects or not. Defaults to our built-in `stringFormatter`.

This is the default for `function` and `object` elements. `function`'s are formatted as empty ``.

```js
{
  // Uses the default string formatter
  object: objectFormatter(),

  // Uses custom string formatter
  // You rarely need to this since the object formatter will use the string formatter that you set.
  object: objectFormatter(myStringFormatter()),
}
```

### json2csv Parser (Synchronous API)

`json2csv` can also be used programmatically as a synchronous converter using its `parse` method.

```js
const { Parser } = require('json2csv');

const fields = ['field1', 'field2', 'field3'];
const opts = { fields };

try {
  const parser = new Parser(opts);
  const csv = parser.parse(myData);
  console.log(csv);
} catch (err) {
  console.error(err);
}
```

you can also use the convenience method `parse`

```js
const { parse } = require('json2csv');

const fields = ['field1', 'field2', 'field3'];
const opts = { fields };

try {
  const csv = parse(myData, opts);
  console.log(csv);
} catch (err) {
  console.error(err);
}
```

Both of the methods above load the entire JSON in memory and do the whole processing in-memory while blocking Javascript event loop. For that reason is rarely a good reason to use it until your data is very small or your application doesn't do anything else.

### json2csv Async Parser (Streaming API)

The synchronous API has the downside of loading the entire JSON array in memory and blocking JavaScript's event loop while processing the data. This means that your server won't be able to process more request or your UI will become irresponsive while data is being processed. For those reasons, it is rarely a good reason to use it unless your data is very small or your application doesn't do anything else.

The async parser processes the data as a non-blocking stream. This approach ensures a consistent memory footprint and avoid blocking JavaScript's event loop. Thus, it's better suited for large datasets or system with high concurrency.

One very important difference between the asynchronous and the synchronous APIs is that using the asynchronous API json objects are processed one by one. In practice, this means that only the fields in the first object of the array are automatically detected and other fields are just ignored. To avoid this, it's advisable to ensure that all the objects contain exactly the same fields or provide the list of fields using the `fields` option.

The async API takes a second options arguments that is directly passed to the underlying streams and accepts the same options as the standard [Node.js streams](https://nodejs.org/api/stream.html#stream_new_stream_duplex_options).

Instances of `AsyncParser` expose three objects expose a `parse` method similar to the sync API which takes both JSON arrays/objects and readable streams as input and returns a stream that produces the CSV.

```js
const { AsyncParser } = require('json2csv');

const fields = ['field1', 'field2', 'field3'];
const opts = { fields };
const transformOpts = { highWaterMark: 8192 };

const asyncParser = new AsyncParser(opts, transformOpts);

let csv = '';
asyncParser.parse(data)
  .on('data', (chunk) => (csv += chunk.toString()))
  .on('end', () => console.log(csv))
  .on('error', (err) => console.error(err))
  // You can also listen for events on the conversion and see how the header or the lines are coming out.
  .on('header', (header) => console.log(header))
  .on('line', (line) => console.log(line));
```

Using the async API you can transform streaming JSON into CSV and output directly to a writable stream.
```js
const { createReadStream, createWriteStream } = require('fs');
const { AsyncParser } = require('json2csv');

const fields = ['field1', 'field2', 'field3'];
const opts = { fields };
const transformOpts = { highWaterMark: 8192 };

const input = createReadStream(inputPath, { encoding: 'utf8' });
const output = createWriteStream(outputPath, { encoding: 'utf8' });

const asyncParser = new AsyncParser(opts, transformOpts);

asyncParser.parse(input).pipe(output);
```

`AsyncParser` also exposes a convenience `promise` method which turns the stream into a promise and resolves the whole CSV:

```js
const { AsyncParser } = require('json2csv');

const fields = ['field1', 'field2', 'field3'];
const opts = { fields };
const transformOpts = { highWaterMark: 8192 };

const asyncParser = new AsyncParser(opts, transformOpts);

let csv = await asyncParser.parse(data).promise();
```

### json2csv Transform (Streaming API)

json2csv also exposes the raw stream transform so you can pipe your json content into it. This is the same Transform that `AsyncParser` uses under the hood.

```js
const { createReadStream, createWriteStream } = require('fs');
const { Transform } = require('json2csv');

const fields = ['field1', 'field2', 'field3'];
const opts = { fields };
const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };

const input = createReadStream(inputPath, { encoding: 'utf8' });
const output = createWriteStream(outputPath, { encoding: 'utf8' });
const json2csv = new Transform(opts, transformOpts);

const processor = input.pipe(json2csv).pipe(output);

// You can also listen for events on the conversion and see how the header or the lines are coming out.
json2csv
  .on('header', (header) => console.log(header))
  .on('line', (line) => console.log(line))
  .on('error', (err) => console.log(err));
```

The stream API can also work in object mode. This is useful when you have an input stream in object mode or if you are getting JSON objects one by one and want to convert them to CSV as they come.

```js
const { Transform } = require('json2csv');
const { Readable } = require('stream');

const input = new Readable({ objectMode: true });
input._read = () => {};
// myObjectEmitter is just a fake example representing anything that emit objects.
myObjectEmitter.on('object', (obj) => input.push(obj));
// Pushing a null close the stream
myObjectEmitter.end(() => input.push(null));

const output = process.stdout;

const opts = {};
const transformOpts = { objectMode: true };

const json2csv = new Transform(opts, transformOpts);
const processor = input.pipe(json2csv).pipe(output);
```

## Upgrading

### Upgrading from 5.X to 6.X

The CLI hasn't changed at all.

#### Formatters

In the JavaScript modules, `formatters` are introduced and the `quote`, `escapedQuote` and `excelStrings` options are removed.

Custom `quote` and `escapedQuote` are applied by setting the properties in the `string` formatter.

```js
const { Parser } = require('json2csv');
const json2csvParser = new Parser({ quote: "'", escapedQuote: "\\'" });
const csv = json2csvParser.parse(myData);
```

should be replaced by

```js
const { Parser, formatter: { string: stringFormatter } } = require('json2csv');
const json2csvParser = new Parser({
  formatters: {
    string: stringFormatter({ quote: '\'', escapedQuote: '\\\'' })),
  }
});
const csv = json2csvParser.parse(myData);
```

`excelStrings` can be used by using the `stringExcel` formatter.

```js
const { Parser } = require('json2csv');
const json2csvParser = new Parser({
  quote: "'",
  escapedQuote: "\\'",
  excelStrings: true,
});
const csv = json2csvParser.parse(myData);
```

should be replaced by

```js
const { Parser, formatter: { stringExcel: stringExcelFormatter } } = require('json2csv');
const json2csvParser = new Parser({
  formatters: {
    string: stringExcelFormatter(stringFormatter({ quote: '\'', escapedQuote: '\\\'' }))),
  }
});
const csv = json2csvParser.parse(myData);
```

#### AsyncParser

Async parse have been simplified to be a class with a single `parse` method which replaces the previous `fromInput` method. `throughTransform` and `toOutput` can be replaced by `pipe` method or the newer `pipeline` utility.

What used to be
```js
const { AsyncParser } = require('json2csv');
const json2csvParser = new AsyncParser();
const csv = await json2csvParser.fromInput(myData).throughTransform(myTransform).toOutput(myOutput);
```

should be replaced by

```js
const { AsyncParser } = require('json2csv');
const json2csvParser = new AsyncParser();
json2csvParser.parse(myData.pipe(myTransform)).pipe(myOutput);
```

The `promise` method has been kept but it doesn't take any argument as it used to. Now it always keeps the whole CSV and returns it.


What used to be
```js
const { AsyncParser } = require('json2csv');
const json2csvParser = new AsyncParser();
const csv = await json2csvParser.fromInput(myData).promise();
```

should be replaced by

```js
const { AsyncParser } = require('json2csv');
const json2csvParser = new AsyncParser();
const csv = await json2csvParser.parse(myData).promise();
```

If you want to wait for the stream to finish but not keep the CSV in memory you can use the `stream.finished` utility from Node's stream module.

The `input`, `transform` and `processor` properties have been remove.
`input` is just your data stream.
`transform` and `processor` are equivalent to the return of the `parse` method.


Before you could instantiate an `AsyncParser` and push data into it. Now you can simply pass the data as the argument to the `parse` method if you have the entire dataset or you can manually create an array and push data to it.

What used to be

```js
asyncParser.processor
  .on('data', (chunk) => (csv += chunk.toString()))
  .on('end', () => console.log(csv))
  .on('error', (err) => console.error(err));

myData.default.forEach(item => asyncParser.input.push(item));
asyncParser.input.push(null); // Sending `null` to a stream signal that no more data is expected and ends it.
```

now can be done as

```js
asyncParser.parse(myData)
  .on('data', (chunk) => (csv += chunk.toString()))
  .on('end', () => console.log(csv))
  .on('error', (err) => console.error(err));
```

or done manually as

```js
const { Readable } = require('stream');

const myManualInput = new Readable({ objectMode: true });
myManualInput._read = () => {};

asyncParser.parse(myManualInput)
  .on('data', (chunk) => (csv += chunk.toString()))
  .on('end', () => console.log(csv))
  .on('error', (err) => console.error(err));

myData.default.forEach(item => myManualInput.push(item)); // This is useful when the data is coming asynchronously from a request or ws for example.
myManualInput.push(null);
```

### Upgrading from 4.X to 5.X

In the CLI, the config file option, `-c`, used to be a list of fields and now it's expected to be a full configuration object.

The `stringify` option hass been removed.

`doubleQuote` has been renamed to `escapedQuote`.

In the javascript Javascript modules, `transforms` are introduced and all the `unwind` and `flatten` -related options has been moved to their own transforms.

What used to be

```js
const { Parser } = require('json2csv');
const json2csvParser = new Parser({
  unwind: paths,
  unwindBlank: true,
  flatten: true,
  flattenSeparator: '__',
});
const csv = json2csvParser.parse(myData);
```

should be replaced by

```js
const {
  Parser,
  transform: { unwind, flatten },
} = require('json2csv');
const json2csvParser = new Parser({
  transforms: [unwind({ paths, blankOut: true }), flatten('__')],
});
const csv = json2csvParser.parse(myData);
```

You can se the documentation for json2csv v4.X.X [here](https://github.com/zemirco/json2csv/blob/v4/README.md).

### Upgrading from 3.X to 4.X

What in 3.X used to be

```js
const json2csv = require('json2csv');
const csv = json2csv({ data: myData, fields: myFields, unwindPath: paths, ... });
```

should be replaced by

```js
const { Parser } = require('json2csv');
const json2csvParser = new Parser({ fields: myFields, unwind: paths, ... });
const csv = json2csvParser.parse(myData);
```

or the convenience method

```js
const json2csv = require('json2csv');
const csv = json2csv.parse(myData, { fields: myFields, unwind: paths, ... });
```

Please note that many of the configuration parameters have been slightly renamed. Please check one by one that all your parameters are correct.
You can se the documentation for json2csv 3.11.5 [here](https://github.com/zemirco/json2csv/blob/v3.11.5/README.md).

## Known Gotchas

### Excel support

#### Avoiding excel auto-formatting

Excel tries to automatically detect the format of every field (number, date, string, etc.) regardless of whether the field is quoted or not.

This might produce few undesired effects with, for example, serial numbers:

- Large numbers are displayed using scientific notation
- Leading zeros are stripped.

Enabling the `excelString` option produces an Excel-specific CSV file that forces Excel to interpret string fields as strings. Please note that the CSV will look incorrect if viewing it somewhere else than Excel.

#### Avoiding CSV injection

As part of Excel automatically format detection, fields regarded as formulas (starting with `=`, `+`, `-` or `@`) are interpreted regardless of whether the field is quoted or not, creating a security risk (see [CSV Injection](https://www.owasp.org/index.php/CSV_Injection).

This issue has nothing to do with the CSV format, since CSV knows nothing about formulas, but with how Excel parses CSV files.

Enabling the `excelString` option produces an Excel-specific CSV file that forces Excel to interpret string fields as strings. Please note that the CSV will look incorrect if viewing it somewhere else than Excel.

#### Preserving new lines

Excel only recognizes `\r\n` as valid new line inside a cell.

#### Unicode Support

Excel can display Unicode correctly (just setting the `withBOM` option to true). However, Excel can't save unicode so, if you perform any changes to the CSV and save it from Excel, the Unicode characters will not be displayed correctly.

### PowerShell escaping

PowerShell do some estrange double quote escaping escaping which results on each line of the CSV missing the first and last quote if outputting the result directly to stdout. Instead of that, it's advisable that you write the result directly to a file.

## Development

### Pulling the repo

After you clone the repository you just need to install the required packages for development by runnning following command under json2csv dir.

```sh
$ npm install
```

### Building

json2csv is packaged using `rollup`. You can generate the packages running:

```sh
npm run build
```

which generates 3 files under the `dist folder`:

- `json2csv.umd.js` UMD module transpiled to ES5
- `json2csv.esm.js` ES5 module (import/export)
- `json2csv.cjs.js` CommonJS module

When you use packaging tools like webpack and such, they know which version to use depending on your configuration.

### Linting & Testing

Run the following command to check the code style.

```sh
$ npm run lint
```

Run the following command to run the tests and return coverage

```sh
$ npm run test-with-coverage
```

### Contributing changes

Before making any pull request please ensure sure that your code is formatted, test are passing and test coverage haven't decreased.

## License

See [LICENSE.md].

[npm-badge]: https://badge.fury.io/js/json2csv.svg
[npm-badge-url]: http://badge.fury.io/js/json2csv
[travis-badge]: https://travis-ci.org/zemirco/json2csv.svg
[travis-badge-url]: https://travis-ci.org/zemirco/json2csv
[coveralls-badge]: https://coveralls.io/repos/zemirco/json2csv/badge.svg?branch=master
[coveralls-badge-url]: https://coveralls.io/r/zemirco/json2csv?branch=master
[changelog]: https://github.com/zemirco/json2csv/blob/master/CHANGELOG.md
[license.md]: https://github.com/zemirco/json2csv/blob/master/LICENSE.md
