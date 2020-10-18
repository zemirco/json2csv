---
order: 6
---

## Transform API (Streaming)

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
