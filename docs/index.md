# json2csv

Converts JSON into CSV with column titles and proper line endings.  
Can be used as a module and from the command line.

See the [CHANGELOG] for details about the latest release.

## Upgrading

### Upgrading from 5.X to 6.X

The CLI hasn't changed at all.

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

### Upgrading from 4.X to 5.X

In the CLI, the config file option, `-c`, used to be a list of fields and now it's expected to be a full configuration object.

The `stringify` option has been removed.

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
