---
order: 5
---

## Async Parser API (Streaming)

The synchronous API has the downside of loading the entire JSON array in memory and blocking JavaScript's event loop while processing the data. This means that your server won't be able to process more request or your UI will become irresponsive while data is being processed. For those reasons, it is rarely a good reason to use it unless your data is very small or your application doesn't do anything else.

The async parser processes the data as a non-blocking stream. This approach ensures a consistent memory footprint and avoid blocking JavaScript's event loop. Thus, it's better suited for large datasets or system with high concurrency.

One very important difference between the asynchronous and the synchronous APIs is that using the asynchronous API json objects are processed one by one. In practice, this means that only the fields in the first object of the array are automatically detected and other fields are just ignored. To avoid this, it's advisable to ensure that all the objects contain exactly the same fields or provide the list of fields using the `fields` option.

The async API takes a second options arguments that is directly passed to the underlying streams and accepts the same options as the standard [Node.js streams](https://nodejs.org/api/stream.html#stream_new_stream_duplex_options).

Instances of `AsyncParser` expose three objects:

- _input:_ Which allows to push more data
- _processor:_ A readable string representing the whole data processing. You can listen to all the standard events of Node.js streams.
- _transform:_ The json2csv transform. See below for more details.

```js
const { AsyncParser } = require('json2csv');

const fields = ['field1', 'field2', 'field3'];
const opts = { fields };
const transformOpts = { highWaterMark: 8192 };

const asyncParser = new AsyncParser(opts, transformOpts);

let csv = '';
asyncParser.processor
  .on('data', (chunk) => (csv += chunk.toString()))
  .on('end', () => console.log(csv))
  .on('error', (err) => console.error(err));

// You can also listen for events on the conversion and see how the header or the lines are coming out.
asyncParser.transform
  .on('header', (header) => console.log(header))
  .on('line', (line) => console.log(line))
  .on('error', (err) => console.log(err));

asyncParser.input.push(data); // This data might come from an HTTP request, etc.
asyncParser.input.push(null); // Sending `null` to a stream signal that no more data is expected and ends it.
```

`AsyncParser` also exposes some convenience methods:

- `fromInput` allows you to set the input stream.
- `throughTransform` allows you to add transforms to the stream.
- `toOutput` allows you to set the output stream.
- `promise` returns a promise that resolves when the stream ends or errors. Takes a boolean parameter to indicate if the resulting CSV should be kept in-memory and be resolved by the promise.

```js
const { createReadStream, createWriteStream } = require('fs');
const { AsyncParser } = require('json2csv');

const fields = ['field1', 'field2', 'field3'];
const opts = { fields };
const transformOpts = { highWaterMark: 8192 };

// Using the promise API
const input = createReadStream(inputPath, { encoding: 'utf8' });
const asyncParser = new JSON2CSVAsyncParser(opts, transformOpts);
const parsingProcessor = asyncParser.fromInput(input);

parsingProcessor
  .promise()
  .then((csv) => console.log(csv))
  .catch((err) => console.error(err));

// Using the promise API just to know when the process finnish
// but not actually load the CSV in memory
const input = createReadStream(inputPath, { encoding: 'utf8' });
const output = createWriteStream(outputPath, { encoding: 'utf8' });
const asyncParser = new JSON2CSVAsyncParser(opts, transformOpts);
const parsingProcessor = asyncParser.fromInput(input).toOutput(output);

parsingProcessor.promise(false).catch((err) => console.error(err));
```

you can also use the convenience method `parseAsync` which accept both JSON arrays/objects and readable streams and returns a promise.

```js
const { parseAsync } = require('json2csv');

const fields = ['field1', 'field2', 'field3'];
const opts = { fields };

parseAsync(myData, opts)
  .then((csv) => console.log(csv))
  .catch((err) => console.error(err));
```
