'use strict';

const { Transform } = require('stream');
const JSON2CSVTransform = require('./JSON2CSVTransform');
const { fastJoin } = require('./utils');

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
        .on('finish', () => resolve(fastJoin(csvBuffer, '')))
        .on('error', err => reject(err));
    });
  }
}

module.exports = JSON2CSVAsyncParser