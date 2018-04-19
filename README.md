# json2csv

Converts json into csv with column titles and proper line endings.  
Can be used as a module and from the command line.

[![npm version][npm-badge]][npm-badge-url]
[![Build Status][travis-badge]][travis-badge-url]
[![Coverage Status][coveralls-badge]][coveralls-badge-url]
[![Dependency Status][dev-badge]][dev-badge-url]

See the [CHANGELOG] for details about the latest release.

## Features

- Uses proper line endings on various operating systems
- Handles double quotes
- Allows custom column selection
- Allows specifying nested properties
- Reads column selection from file
- Pretty writing to stdout
- Supports optional custom delimiters
- Supports optional custom eol value
- Supports optional custom quotation marks
- Optional header.
- If field doesn't exist in object the field value in CSV will be empty.
- Preserve new lines in values. Should be used with \r\n line endings for full compatibility with Excel.
- Add a BOM character at the beginning of the csv to make Excel displaying special characters correctly.

## How to install

```bash
# Global so it can be call from anywhere
$ npm install -g json2csv
# or as a dependency of a project
$ npm install json2csv --save
```

## Command Line Interface

`json2csv` can be called from the command line if installed globally (using the `-g` flag).

```bash
  Usage: json2csv [options]


  Options:

    -V, --version                       output the version number
    -i, --input <input>                 Path and name of the incoming json file. If not provided, will read from stdin.
    -o, --output [output]               Path and name of the resulting csv file. Defaults to stdout.
    -n, --ndjson                        Treat the input as NewLine-Delimited JSON.
    -s, --no-streaming                  Process the whole JSON array in memory instead of doing it line by line.
    -f, --fields <fields>               Specify the fields to convert.
    -c, --fields-config <path>          Specify a file with a fields configuration as a JSON array.
    -u, --unwind <paths>                Creates multiple rows from a single JSON document similar to MongoDB unwind.
    -B, --unwind-blank                  When unwinding, blank out instead of repeating data.
    -F, --flatten                       Flatten nested objects
    -v, --default-value [defaultValue]  Specify a default value other than empty string.
    -q, --quote [value]                 Specify an alternate quote value.
    -Q, --double-quote [value]          Specify a value to replace double quote in strings
    -d, --delimiter [delimiter]         Specify a delimiter other than the default comma to use.
    -e, --eol [value]                   Specify an End-of-Line value for separating rows.
    -E, --excel-strings                 Converts string data into normalized Excel style data
    -H, --no-header                     Disable the column name header
    -a, --include-empty-rows            Includes empty rows in the resulting CSV output.
    -b, --with-bom                      Includes BOM character at the beginning of the csv.
    -p, --pretty                        Use only when printing to console. Logs output in pretty tables.
    -h, --help                          output usage information
```

An input file `-i` and fields `-f` are required. If no output `-o` is specified the result is logged to the console.
Use `-p` to show the result in a beautiful table inside the console.

### CLI examples

#### Input file and specify fields

```bash
$ json2csv -i input.json -f carModel,price,color
carModel,price,color
"Audi",10000,"blue"
"BMW",15000,"red"
"Mercedes",20000,"yellow"
"Porsche",30000,"green"
```

#### Input file, specify fields and use pretty logging

```bash
$ json2csv -i input.json -f carModel,price,color -p
```

![Screenshot](https://s3.amazonaws.com/zeMirco/github/json2csv/json2csv-pretty.png)

#### Generating CSV containing only specific fields

```bash
$ json2csv -i input.json -f carModel,price,color -o out.csv
$ cat out.csv
carModel,price,color
"Audi",10000,"blue"
"BMW",15000,"red"
"Mercedes",20000,"yellow"
"Porsche",30000,"green"
```

Same result will be obtained using passing the fields as a file.

```bash
$ json2csv -i input.json -l fieldList.txt -o out.csv
```

where the file `fieldList.txt` contains

```
carModel
price
color
```

#### Read input from stdin

```bash
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

```bash
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
- `flatten` - Boolean, flattens nested JSON using [flat]. Defaults to `false`.
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
```javascript
const Json2csvParser = require('json2csv').Parser;
const fields = ['field1', 'field2', 'field3'];
const opts = { fields };

try {
  const parser = new Json2csvParser(opts);
  const csv = parser.parse(myData);
  console.log(csv);
} catch (err) {
  console.error(err);
}
```

you can also use the convenience method `parse`

```javascript
const json2csv = require('json2csv').parse;
const fields = ['field1', 'field2', 'field3'];
const opts = { fields };

try {
  const csv = json2csv(myData, opts);
  console.log(csv);
} catch (err) {
  console.error(err);
}
```

### json2csv transform (Streaming API)

The parse method is really good but has the downside of loading the entire JSON array in memory. This might not be optimal or even possible for large JSON files.

For such cases json2csv offers a stream transform so pipe your json content into it and it will output it.

One very important difference between the transform and the parser is that the json objects are processed one by one. In practice, this means that only the fields in the first object of the array are considered and fields in other other objects that were not present in the first one are just ignored. To avoid this. It's advisable to ensure that all the objects contain exactly the same fields or provide the list of fields using the `fields` option.

```javascript
const fs = require('fs');
const Json2csvTransform = require('json2csv').Transform;

const fields = ['field1', 'field2', 'field3'];
const opts = { fields };
const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };

const input = fs.createReadStream(inputPath, { encoding: 'utf8' });
const output = fs.createWriteStream(outputPath, { encoding: 'utf8' });
const json2csv = new Json2csvTransform(opts, transformOpts);

const processor = input.pipe(json2csv).pipe(output);

// You can also listen for events on the conversion and see how the header or the lines are coming out.
json2csv
  .on('header', header => console.log(header))
  .on('line', line => console.log(line))
  .on('error', err => console.log(err));
```

### Javascript module examples

#### Example `fields` option
``` javascript
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

```javascript
const Json2csvParser = require('json2csv').Parser;
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

const json2csvParser = new Json2csvParser({ fields });
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

```javascript
const Json2csvParser = require('json2csv').Parser;
const fields = ['car', 'color'];

const json2csvParser = new Json2csvParser({ fields });
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

```javascript
const Json2csvParser = require('json2csv').Parser;
const fields = [{
  label: 'Car Name',
  value: 'car'
},{
  label: 'Price USD',
  value: 'price'
}];

const json2csvParser = new Json2csvParser({ fields });
const csv = json2csvParser.parse(myCars, { fields });

console.log(csv);
```

#### Example 4

You can also specify nested properties using dot notation.

```javascript
const Json2csvParser = require('json2csv').Parser;
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

const json2csvParser = new Json2csvParser({ fields });
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

```javascript
const Json2csvParser = require('json2csv').Parser;
const fields = ['car', 'price', 'color'];

const json2csvParser = new Json2csvParser({ fields, delimiter: '\t' });
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

```javascript
const Json2csvParser = require('json2csv').Parser;
const fields = [{
  label: 'Car Name',
  value: 'car'
},{
  label: 'Price USD',
  value: 'price'
}];

const json2csvParser = new Json2csvParser({ fields, quote: '' });
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

```javascript
const Json2csvParser = require('json2csv').Parser;
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

const json2csvParser = new Json2csvParser({ fields, unwind: 'colors' });
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

```javascript
const Json2csvParser = require('json2csv').Parser;
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

const json2csvParser = new Json2csvParser({ fields, unwind: ['items', 'items.items'] });
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

```javascript
const Json2csvParser = require('json2csv').Parser;
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

const json2csvParser = new Json2csvParser({ fields, unwind: ['items', 'items.items'], unwindBlank: true });
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
```
const json2csv = require('json2csv');
const csv = json2csv({ data: myData, fields: myFields, unwindPath: paths, ... });
```

can be replaced by
```
const Json2csvParser = require('json2csv').Parser;
const json2csvParser = new Json2csvParser({ fields: myFields, unwind: paths, ... });
const csv = json2csvParser.parse(myData);
```

or the convenience method
```
const json2csv = require('json2csv');
const csv = json2csv.parse(myData, { fields: myFields, unwind: paths, ... });
```

Please note that many of the configuration parameters have been slightly renamed. Please check one by one that all your parameters are correct.
You can se the documentation for json2csv 3.11.5 [here](https://github.com/zemirco/json2csv/blob/v3.11.5/README.md).

## Building

When developing, it's necessary to run `webpack` to prepare the built script. This can be done easily with `npm run build`.

If `webpack` is not already available from the command line, use `npm install -g webpack`.

## Testing

Run the folowing command to check the code style.

```bash
$ npm run lint
```

Run the following command to run the tests and return coverage

```bash
$ npm run test-with-coverage
```

## Contributors

After you clone the repository you just need to install the required packages for development by runnning following command under json2csv dir.

```bash
$ npm install
```

Before making any pull request please ensure sure that your code is formatted, test are passing and test coverage haven't decreased. (See [Testing](#testing))

## Similar Projects

* [Papa Parse](http://papaparse.com/)

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
[flat]: https://www.npmjs.com/package/flat
