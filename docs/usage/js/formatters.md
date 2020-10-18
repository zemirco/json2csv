---
order: 3
---

## Formatters

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
  // apply transformations or create new object
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
