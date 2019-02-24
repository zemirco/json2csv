'use strict';

const { Transform } = require('stream');
const JSON2CSVTransform = require('./JSON2CSVTransform');

class JSON2CSVAsyncParser {
  constructor(opts, transformOpts) {
    this.input = new Transform(transformOpts);
    this.input._read = () => {};

    this.transform = new JSON2CSVTransform(opts, transformOpts);
    this.processor = this.input.pipe(this.transform);
  }

  fromInput(input) {
    if (this._input) {
      throw new Error('Async parser already has an input.');
    }
    this._input = input;
    this.input = this._input.pipe(this.processor);
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

  promise() {
    return new Promise((resolve, reject) => {
      let csv = '';
      this.processor
        .on('data', chunk => (csv += chunk.toString()))
        .on('finish', () => resolve(csv))
        .on('error', err => reject(err));
    });
  }
}

module.exports = JSON2CSVAsyncParser