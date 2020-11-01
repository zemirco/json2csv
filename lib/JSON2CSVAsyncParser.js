'use strict';

const { Readable, Transform } = require('stream');
const JSON2CSVTransform = require('./JSON2CSVTransform');
const { ArrayAsStream } = require('./utils');

class JSON2CSVAsyncParser {
  constructor(opts, transformOpts) {
    this._opts = opts;
    this._transformOpts = transformOpts;

    this.input = new Transform(this._transformOpts);
    this.input._read = () => {};

    this.transform = new JSON2CSVTransform(this._opts, this._transformOpts);
    this.processor = this.input.pipe(this.transform);
  }

  fromInput(input) {
    if (this._input) {
      throw new Error('Async parser already has an input.');
    }

    if (input instanceof Readable) {
      this._input = input;
    } else {
      this._input = new ArrayAsStream(Array.isArray(input) ? input : [input]);
      this.transform = new JSON2CSVTransform(this._opts, { ...this._transformOpts, objectMode: true });
    }

    this.input = this._input;
    this.processor = this.input.pipe(this.transform);
    return this;
  }

  throughTransform(transform) {
    if (this._output) {
      throw new Error('Can\'t add transforms once an output has been added.');
    }
    this.processor = this.processor.pipe(transform);
    return this;
  }

  toOutput(output) {
    if (this._output) {
      throw new Error('Async parser already has an output.');
    }
    this._output = output;
    this.processor = this.processor.pipe(output);
    return this;
  }

  promise(returnCSV = true) {
    return new Promise((resolve, reject) => {
      if (!returnCSV) {
        this.processor
          .on('finish', () => resolve())
          .on('error', err => reject(err));
        return;
      }

      let csvBuffer = [];
      this.processor
        .on('data', chunk => csvBuffer.push(chunk.toString()))
        .on('finish', () => resolve(csvBuffer.join('')))
        .on('error', err => reject(err));
    });
  }
}

module.exports = JSON2CSVAsyncParser;
