# json2csv

Converts json into csv with column titles and proper line endings.  
Can be used as a module and from the command line.

[![npm version][npm-badge]][npm-badge-url]
[![Build Status][travis-badge]][travis-badge-url]
[![Coverage Status][coveralls-badge]][coveralls-badge-url]
[![Dependency Status][dev-badge]][dev-badge-url]

See the [CHANGELOG] for details about the latest release.

## Features

- Fast and lightweight
- Scalable to infinitely large datasets (using stream processing)
- Support for standard JSON as well as NDJSON
- Advanced data selection (automatic field discovery, underscore-like selectors, custom data getters, default values for missing fields, flattening nested object, unwinding arrays, etc.)
- Highly customizable (supportting custom quotation marks, delimiters, eol values, etc.)
- Automatic escaping (preserving new lines, quotes, etc. in them)
- Optional headers
- Unicode encoding support
- Pretty printing in table format to stdout

## How to install

You can install json2csv as a dependency using NPM.

```sh
# Global so it can be call from anywhere
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

## Command Line Interface

`json2csv` can be called from the command line if installed globally (using the `-g` flag).

```sh
Usage: json2csv [options]

Options:
  -V, --version                        output the version number
  -i, --input <input>                  Path and name of the incoming json file. Defaults to stdin.
  -o, --output [output]                Path and name of the resulting csv file. Defaults to stdout.
  -n, --ndjson                         Treat the input as NewLine-Delimited JSON.
  -s, --no-streaming                   Process the whole JSON array in memory instead of doing it line by line.
  -f, --fields <fields>                List of fields to process. Defaults to field auto-detection.
  -c, --fields-config <path>           File with a fields configuration as a JSON array.
  -u, --unwind <paths>                 Creates multiple rows from a single JSON document similar to MongoDB unwind.
  -B, --unwind-blank                   When unwinding, blank out instead of repeating data.
  -F, --flatten                        Flatten nested objects.
  -S, --flatten-separator <separator>  Flattened keys separator. Defaults to '.'.
  -v, --default-value [defaultValue]   Default value to use for missing fields.
  -q, --quote [value]                  Character(s) to use a quote mark. Defaults to '"'.
  -Q, --double-quote [value]           Character(s) to use as a escaped quote. Defaults to a double `quote`, '""'.
  -d, --delimiter [delimiter]          Character(s) to use as delimiter. Defaults to ','.
  -e, --eol [value]                    Character(s) to use as End-of-Line for separating rows. Defaults to '\n'.
  -E, --excel-strings                  Wraps string data to force Excel to interpret it as string even if it contains a number.
  -H, --no-header                      Disable the column name header.
  -a, --include-empty-rows             Includes empty rows in the resulting CSV output.
  -b, --with-bom                       Includes BOM character at the beginning of the CSV.
  -p, --pretty                         Print output as a pretty table. Use only when printing to console.
  -h, --help                           output usage information
```

If no input `-i` is specified the result is expected from to the console standard input.
If no output `-o` is specified the result is printed to the console standard output.
If no fields `-f` or `-c` are passed the fields of the first element are used since json2csv CLI process the items one at a time. You can use the `--no-streaming` flag to load the entire JSON in memory and get all the headers. However, keep in mind that this is slower and requires much more memory.
Use `-p` to show the result as a table in the console.

### CLI examples

#### Input file and specify fields

```sh
$ json2csv -i input.json -f carModel,price,color
carModel,price,color
"Audi",10000,"blue"
"BMW",15000,"red"
"Mercedes",20000,"yellow"
"Porsche",30000,"green"
```

#### Input file, specify fields and use pretty logging

```sh
$ json2csv -i input.json -f carModel,price,color -p
```

![Screenshot](https://s3.amazonaws.com/zeMirco/github/json2csv/json2csv-pretty.png)

#### Generating CSV containing only specific fields

```sh
$ json2csv -i input.json -f carModel,price,color -o out.csv
$ cat out.csv
carModel,price,color
"Audi",10000,"blue"
"BMW",15000,"red"
"Mercedes",20000,"yellow"
"Porsche",30000,"green"
```

Same result will be obtained passing the fields config as a file.

```sh
$ json2csv -i input.json -c fieldsConfig.json -o out.csv
```

where the file `fieldsConfig.json` contains

```json
[
  "carModel",
  "price",
  "color"
]
```

#### Read input from stdin

```sh
$ json2csv -f price
[{"price":1000},{"price":2000}]
```

Hit <kbd>Enter</kbd> and afterwards <kbd>CTRL</kbd> + <kbd>D</kbd> to end reading from stdin. The terminal should show

```
price
1000
2000
```

#### Appending to existing CSV

Sometimes you want to add some additional rows with the same columns.
This is how you can do that.

```sh
# Initial creation of csv with headings
$ json2csv -i test.json -f name,version > test.csv
# Append additional rows
$ json2csv -i test.json -f name,version --no-header >> test.csv
```

## Javascript module

`json2csv` can also be use programatically from you javascript codebase.

### Available Options

The programatic APIs take a configuration object very equivalent to the CLI options. 

- `fields` - Array of Objects/Strings. Defaults to toplevel JSON attributes. See example below.
- `ndjson` - Only effective on the streaming API. Indicates that data coming through the stream is NDJSON.
- `unwind` - Array of Strings, creates multiple rows from a single JSON document similar to MongoDB's $unwind
- `unwindBlank` - Boolean, unwind using blank values instead of repeating data.
- `flatten` - Boolean, flattens nested objects. Defaults to `false`.
- `flattenSeparator` - String, separator to use between nested JSON keys when `flatten` option enabled. Defaults to `.` if not specified.
- `defaultValue` - String, default value to use when missing data. Defaults to `<empty>` if not specified. (Overridden by `fields[].default`)
- `quote` - String, quote around cell values and column names. Defaults to `"` if not specified.
- `doubleQuote` - String, the value to replace double quote in strings. Defaults to 2x`quotes` (for example `""`) if not specified.
- `delimiter` - String, delimiter of columns. Defaults to `,` if not specified.
- `eol` - String, overrides the default OS line ending (i.e. `\n` on Unix and `\r\n` on Windows).
- `excelStrings` - Boolean, converts string data into normalized Excel style data.
- `header` - Boolean, determines whether or not CSV file will contain a title column. Defaults to `true` if not specified.
- `includeEmptyRows` - Boolean, includes empty rows. Defaults to `false`.
- `withBOM` - Boolean, with BOM character. Defaults to `false`.

### json2csv parser (Synchronous API)

`json2csv` can also be use programatically as a synchronous converter using its `parse` method. 
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

### json2csv async parser (Streaming API)

The synchronous API has the downside of loading the entire JSON array in memory and blocking javascript's event loop while processing the data. This means that you server won't be able to process more request or your UI will become irresponsive while data is being processed. For those reasons, is rarely a good reason to use it unless your data is very small or your application doesn't do anything else.

The async parser process the data as a non-blocking stream. This approach ensures a consistent memory footprint and avoid blocking javascript's event loop. Thus, it's better suited for large datasets or system with high concurrency. 

One very important difference between the asynchronous and the synchronous APIs is that using the asynchronous API json objects are processed one by one. In practice, this means that only the fields in the first object of the array are automatically detected and other fields are just ignored. To avoid this, it's advisable to ensure that all the objects contain exactly the same fields or provide the list of fields using the `fields` option.

The async API uses takes a second options arguments that's directly passed to the underlying streams and accept the same options as the standard [Node.js streams](https://nodejs.org/api/stream.html#stream_new_stream_duplex_options).

Instances of `AsyncParser` expose three objects:
* *input:* Which allows to push more data
* *processor:* A readable string representing the whole data processing. You can listen to all the standard events of Node.js streams.
* *transform:* The json2csv transform. See bellow for more details.

```js
const { AsyncParser } = require('json2csv');

const fields = ['field1', 'field2', 'field3'];
const opts = { fields };
const transformOpts = { highWaterMark: 8192 };

const asyncParser = new AsyncParser(opts, transformOpts);

let csv = '';
asyncParser.processor
  .on('data', chunk => (csv += chunk.toString()))
  .on('end', () => console.log(csv))
  .on('error', err => console.error(err));
  
// You can also listen for events on the conversion and see how the header or the lines are coming out.
asyncParser.transform
  .on('header', header => console.log(header))
  .on('line', line => console.log(line))
  .on('error', err => console.log(err));

asyncParser.input.push(data); // This data might come from an HTTP request, etc.
asyncParser.input.push(null); // Sending `null` to a stream signal that no more data is expected and ends it.
```

`AsyncParser` also exposes some convenience methods:
* `fromInput` allows you to set the input stream.
* `throughTransform` allows you to add transforms to the stream.
* `toOutput` allows you to set the output stream.
* `promise` returns a promise that resolves when the stream ends or errors.

```js
const { createReadStream, createWriteStream } = require('fs');
const { AsyncParser } = require('json2csv');

const fields = ['field1', 'field2', 'field3'];
const opts = { fields };
const transformOpts = { highWaterMark: 8192 };

const input = createReadStream(inputPath, { encoding: 'utf8' });
const output = createWriteStream(outputPath, { encoding: 'utf8' });
const asyncParser = new JSON2CSVAsyncParser(opts, transformOpts);
asyncParser.fromInput(input).toOutput(output).promise()
  .then(csv => console.log(csv))
  .catch(err => console.error(err));;
```

you can also use the convenience method `parseAsync` which accept both JSON arrays/objects and readable streams and returns a promise.

```js
const { parseAsync } = require('json2csv');

const fields = ['field1', 'field2', 'field3'];
const opts = { fields };

parseAsync(myData, opts)
  .then(csv => console.log(csv))
  .catch(err => console.error(err));
```

### json2csv transform (Streaming API)

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
  .on('header', header => console.log(header))
  .on('line', line => console.log(line))
  .on('error', err => console.log(err));
```

The stream API can also work on object mode. This is useful when you have an input stream in object mode or if you are getting JSON objects one by one and want to convert them to CSV as they come.

```js
    const { Transform } = require("json2csv");
    const { Readable } = require('stream');

    const input = new Readable({ objectMode: true });
    input._read = () => {};
    // myObjectEmitter is just a fake example representing anything that emit objects.
    myObjectEmitter.on('object', obj => input.push(obj));
    // Pushing a null close the stream
    myObjectEmitter.end(()) => input.push(null));

    const output = process.stdout;

    const opts = {};
    const transformOpts = { objectMode: true };

    const json2csv = new Transform(opts, transformOpts);
    const processor = input.pipe(json2csv).pipe(output);
```

### Javascript module examples

#### Example `fields` option
```js
{
  fields: [
    // Supports label -> simple path
    {
      label: 'some label', // (optional, column will be labeled 'path.to.something' if not defined)
      value: 'path.to.something', // data.path.to.something
      default: 'NULL' // default if value is not found (optional, overrides `defaultValue` for column)
    },

    // Supports label -> derived value
    {
      label: 'some label', // Supports duplicate labels (required, else your column will be labeled [function])
      value: (row, field) => row.path1 + row.path2, // field = { label, default }
      default: 'NULL', // default if value function returns null or undefined
      stringify: true // If value is function use this flag to signal if resulting string will be quoted (stringified) or not (optional, default: true)
    },

    // Support pathname -> pathvalue
    'simplepath', // equivalent to {value:'simplepath'}
    'path.to.value' // also equivalent to {value:'path.to.value'}
  ]
}
```

#### Example 1

```js
const { Parser } = require('json2csv');

const fields = ['car', 'price', 'color'];
const myCars = [
  {
    "car": "Audi",
    "price": 40000,
    "color": "blue"
  }, {
    "car": "BMW",
    "price": 35000,
    "color": "black"
  }, {
    "car": "Porsche",
    "price": 60000,
    "color": "green"
  }
];

const json2csvParser = new Parser({ fields });
const csv = json2csvParser.parse(myCars);

console.log(csv);
```

will output to console

```
car, price, color
"Audi", 40000, "blue"
"BMW", 35000, "black"
"Porsche", 60000, "green"
```

#### Example 2

Similarly to [mongoexport](http://www.mongodb.org/display/DOCS/mongoexport) you can choose which fields to export.

```js
const { Parser } = require('json2csv');
const fields = ['car', 'color'];

const json2csvParser = new Parser({ fields });
const csv = json2csvParser.parse(myCars);

console.log(csv);
```

Results in

```
car, color
"Audi", "blue"
"BMW", "black"
"Porsche", "green"
```

#### Example 3

You can choose custom column names for the exported file.

```js
const { Parser } = require('json2csv');

const fields = [{
  label: 'Car Name',
  value: 'car'
},{
  label: 'Price USD',
  value: 'price'
}];

const json2csvParser = new Parser({ fields });
const csv = json2csvParser.parse(myCars);

console.log(csv);
```

#### Example 4

You can also specify nested properties using dot notation.

```js
const { Parser } = require('json2csv');

const fields = ['car.make', 'car.model', 'price', 'color'];
const myCars = [
  {
    "car": {"make": "Audi", "model": "A3"},
    "price": 40000,
    "color": "blue"
  }, {
    "car": {"make": "BMW", "model": "F20"},
    "price": 35000,
    "color": "black"
  }, {
    "car": {"make": "Porsche", "model": "9PA AF1"},
    "price": 60000,
    "color": "green"
  }
];

const json2csvParser = new Parser({ fields });
const csv = json2csvParser.parse(myCars);

console.log(csv);
```

will output to console

```
car.make, car.model, price, color
"Audi", "A3", 40000, "blue"
"BMW", "F20", 35000, "black"
"Porsche", "9PA AF1", 60000, "green"
```

#### Example 5

Use a custom delimiter to create tsv files using the delimiter option:

```js
const { Parser } = require('json2csv');

const fields = ['car', 'price', 'color'];

const json2csvParser = new Parser({ fields, delimiter: '\t' });
const tsv = json2csvParser.parse(myCars);

console.log(tsv);
```

Will output:

```
car price color
"Audi"  10000 "blue"
"BMW" 15000 "red"
"Mercedes"  20000 "yellow"
"Porsche" 30000 "green"
```

If no delimiter is specified, the default `,` is used

#### Example 6

You can choose custom quotation marks.

```js
const { Parser } = require('json2csv');

const fields = [{
  label: 'Car Name',
  value: 'car'
},{
  label: 'Price USD',
  value: 'price'
}];

const json2csvParser = new Parser({ fields, quote: '' });
const csv = json2csvParser.parse(myCars);

console.log(csv);
```

Results in

```
Car Name, Price USD
Audi, 10000
BMW, 15000
Porsche, 30000
```

#### Example 7

You can unwind arrays similar to MongoDB's $unwind operation using the `unwind` option.

```js
const { Parser } = require('json2csv');

const fields = ['carModel', 'price', 'colors'];
const myCars = [
  {
    "carModel": "Audi",
    "price": 0,
    "colors": ["blue","green","yellow"]
  }, {
    "carModel": "BMW",
    "price": 15000,
    "colors": ["red","blue"]
  }, {
    "carModel": "Mercedes",
    "price": 20000,
    "colors": "yellow"
  }, {
    "carModel": "Porsche",
    "price": 30000,
    "colors": ["green","teal","aqua"]
  }
];

const json2csvParser = new Parser({ fields, unwind: 'colors' });
const csv = json2csvParser.parse(myCars);

console.log(csv);
```

will output to console

```
"carModel","price","colors"
"Audi",0,"blue"
"Audi",0,"green"
"Audi",0,"yellow"
"BMW",15000,"red"
"BMW",15000,"blue"
"Mercedes",20000,"yellow"
"Porsche",30000,"green"
"Porsche",30000,"teal"
"Porsche",30000,"aqua"
```

#### Example 8

You can also unwind arrays multiple times or with nested objects.

```js
const { Parser } = require('json2csv');

const fields = ['carModel', 'price', 'items.name', 'items.color', 'items.items.position', 'items.items.color'];
const myCars = [
  {
    "carModel": "BMW",
    "price": 15000,
    "items": [
      {
        "name": "airbag",
        "color": "white"
      }, {
        "name": "dashboard",
        "color": "black"
      }
    ]
  }, {
    "carModel": "Porsche",
    "price": 30000,
    "items": [
      {
        "name": "airbag",
        "items": [
          {
            "position": "left",
            "color": "white"
          }, {
            "position": "right",
            "color": "gray"
          }
        ]
      }, {
        "name": "dashboard",
        "items": [
          {
            "position": "left",
            "color": "gray"
          }, {
            "position": "right",
            "color": "black"
          }
        ]
      }
    ]
  }
];

const json2csvParser = new Parser({ fields, unwind: ['items', 'items.items'] });
const csv = json2csvParser.parse(myCars);

console.log(csv);
```

will output to console

```
"carModel","price","items.name","items.color","items.items.position","items.items.color"
"BMW",15000,"airbag","white",,
"BMW",15000,"dashboard","black",,
"Porsche",30000,"airbag",,"left","white"
"Porsche",30000,"airbag",,"right","gray"
"Porsche",30000,"dashboard",,"left","gray"
"Porsche",30000,"dashboard",,"right","black"
```

#### Example 9

You can also unwind arrays blanking the repeated fields.

```js
const { Parser } = require('json2csv');

const fields = ['carModel', 'price', 'items.name', 'items.color', 'items.items.position', 'items.items.color'];
const myCars = [
  {
    "carModel": "BMW",
    "price": 15000,
    "items": [
      {
        "name": "airbag",
        "color": "white"
      }, {
        "name": "dashboard",
        "color": "black"
      }
    ]
  }, {
    "carModel": "Porsche",
    "price": 30000,
    "items": [
      {
        "name": "airbag",
        "items": [
          {
            "position": "left",
            "color": "white"
          }, {
            "position": "right",
            "color": "gray"
          }
        ]
      }, {
        "name": "dashboard",
        "items": [
          {
            "position": "left",
            "color": "gray"
          }, {
            "position": "right",
            "color": "black"
          }
        ]
      }
    ]
  }
];

const json2csvParser = new Parser({ fields, unwind: ['items', 'items.items'], unwindBlank: true });
const csv = json2csvParser.parse(myCars);

console.log(csv);
```

will output to console

```
"carModel","price","items.name","items.color","items.items.position","items.items.color"
"BMW",15000,"airbag","white",,
,,"dashboard","black",,
"Porsche",30000,"airbag",,"left","white"
,,,,"right","gray"
,,"dashboard",,"left","gray"
,,,,"right","black"
```

### Migrating from 3.X to 4.X

What in 3.X used to be
```js
const json2csv = require('json2csv');
const csv = json2csv({ data: myData, fields: myFields, unwindPath: paths, ... });
```

can be replaced by
```js
const Json2csvParser = require('json2csv').Parser;
const json2csvParser = new Json2csvParser({ fields: myFields, unwind: paths, ... });
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

#### Avoiding excel autoformatting

Excel tries to automatically detect the format of every field (number, date, string, etc.) regardless of whether the field is quoted or not.

This might produce few undesired effects with, for example, serial numbers:
- Large numbers are displayed using scientific notation
- Leading zeros are stripped.

The `excelString` option produces a Excel-specific CSV file that forces Excel to interpret string fields as strings. Please note that the CSV will look incorrect if viewing it somewhere else than Excel.

#### Preserving new lines

Excel only recognize `\r\n` as valid new line inside a cell.

#### Unicode Support

Excel can display Unicode correctly (just setting the `withBOM` option to true). However, Excel can't save unicode so, if you do changes to the CSV and save it from Excel, the Unicode character will not be displayed correctly.


### PowerShell escaping

PowerShell do some estrange double quote escaping escaping which results on each line of the CSV missing the first and last quote if outputting the result directly to stdout. Instead of that, it's advisable that you write the result directly to a file.

## Building

json2csv is packaged using `rollup`. You can generate the packages running:

```sh
npm run build
```
which generates 3 files under the `dist folder`:

* `json2csv.umd.js` UMD module transpiled to ES5
* `json2csv.esm.js` ES5 module (import/export)
* `json2csv.cjs.js` CommonJS module

When you use packaging tools like webpack and such, they know which version to use depending on your configuration.

## Testing

Run the folowing command to check the code style.

```sh
$ npm run lint
```

Run the following command to run the tests and return coverage

```sh
$ npm run test-with-coverage
```

## Contributors

After you clone the repository you just need to install the required packages for development by runnning following command under json2csv dir.

```sh
$ npm install
```

Before making any pull request please ensure sure that your code is formatted, test are passing and test coverage haven't decreased. (See [Testing](#testing))

## License

See [LICENSE.md].

[npm-badge]: https://badge.fury.io/js/json2csv.svg
[npm-badge-url]: http://badge.fury.io/js/json2csv
[travis-badge]: https://travis-ci.org/zemirco/json2csv.svg
[travis-badge-url]: https://travis-ci.org/zemirco/json2csv
[coveralls-badge]: https://coveralls.io/repos/zemirco/json2csv/badge.svg?branch=master
[coveralls-badge-url]: https://coveralls.io/r/zemirco/json2csv?branch=master
[dev-badge]: https://david-dm.org/zemirco/json2csv.svg
[dev-badge-url]: https://david-dm.org/zemirco/json2csv
[CHANGELOG]: https://github.com/zemirco/json2csv/blob/master/CHANGELOG.md
[LICENSE.md]: https://github.com/zemirco/json2csv/blob/master/LICENSE.md
