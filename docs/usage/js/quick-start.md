---
order: 1
---

## Quick Start

`json2csv` can also be use programmatically from you javascript codebase.

The programmatic APIs take a configuration object very similar to the CLI options. All APIs take the exact same options.

- `fields` - Array of Objects/Strings. Defaults to top-level JSON attributes. See example below.
- `ndjson` - Boolean, indicates that the data is in NDJSON format. Only effective when using the streaming API and not in object mode.
- `transforms` - Array of transforms. A transform is a function that receives a data record and returns a transformed record. Transforms are executed in order before converting the data record into a CSV row. See bellow for more details.
- `formatters` - Object where the each key is a Javascript data type and its associated value is a formatters for the given type. A formatter is a function that receives the raw js value of a given type and formats it as a valid CSV cell. Supported types are the types returned by `typeof` i.e. `undefined`, `boolean`, `number`, `bigint`, `string`, `symbol`, `function` and `object`.
- `defaultValue` - Default value to use when missing data. Defaults to `<empty>` if not specified. (Overridden by `fields[].default`)
- `delimiter` - String, delimiter of columns. Defaults to `,` if not specified.
- `eol` - String, overrides the default OS line ending (i.e. `\n` on Unix and `\r\n` on Windows).
- `header` - Boolean, determines whether or not CSV file will contain a title column. Defaults to `true` if not specified.
- `includeEmptyRows` - Boolean, includes empty rows. Defaults to `false`.
- `withBOM` - Boolean, with BOM character. Defaults to `false`.

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
