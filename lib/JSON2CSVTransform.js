'use strict';

const Transform = require('stream').Transform;
const Parser = require('jsonparse');
const JSON2CSVBase = require('./JSON2CSVBase');

class JSON2CSVTransform extends Transform {
  constructor(params) {
    super(params);

    // Inherit methods from JSON2CSVBase since extends doesn't
    // allow multiple inheritance and manually preprocess params
    Object.getOwnPropertyNames(JSON2CSVBase.prototype)
      .forEach(key => (this[key] = JSON2CSVBase.prototype[key]));
    this.params = this.preprocessParams(params);

    this._data = '';
    this._hasWritten = false;

    if (this.params.ndjson) {
      this.initNDJSONParse();
    } else {
      this.initJSONParser();
    }

    if (this.params.withBOM) {
      this.push('\ufeff');
    }

  }

  /**
   * Init the transform with a parser to process NDJSON data.
   * It maintains a buffer of received data, parses each line
   * as JSON and send it to `pushLine for processing.
   */
  initNDJSONParse() {
    const transform = this;

    this.parser = {
      _data: '',
      write(chunk) {
        this._data += chunk.toString();
        const lines = this._data
          .split('\n')
          .map(line => line.trim())
          .filter(line => line !== '');

        lines
          .forEach((line, i) => {
            try {
              transform.pushLine(JSON.parse(line));
            } catch(e) {
              if (i !== lines.length - 1) {
                e.message = 'Invalid JSON (' + line + ')'
                transform.emit('error', e);
              }
            }
          });
        this._data = this._data.slice(this._data.lastIndexOf('\n'));
      }
    };
  }
  
  /**
   * Init the transform with a parser to process JSON data.
   * It maintains a buffer of received data, parses each as JSON 
   * item if the data is an array or the data itself otherwise
   * and send it to `pushLine` for processing.
   */
  initJSONParser() {
    const transform = this;
    this.parser = new Parser();
    this.parser.onValue = function (value) {
      if (this.stack.length !== this.depthToEmit) return;
      transform.pushLine(value);
    }

    this.parser._onToken = this.parser.onToken;

    this.parser.onToken = function (token, value) {
      transform.parser._onToken(token, value);

      if (this.stack.length === 0 
        && !transform.params.fields
        && this.mode !== Parser.C.ARRAY 
        && this.mode !== Parser.C.OBJECT) {
        this.onError(new Error('params should include "fields" and/or non-empty "data" array of objects'));
      }
      if (this.stack.length === 1) {
        if(this.depthToEmit === undefined) {
          // If Array emit its content, else emit itself
          this.depthToEmit = (this.mode === Parser.C.ARRAY) ? 1 : 0;
        }

        if (this.depthToEmit !== 0 && this.stack.length === 1) {
          // No need to store the whole root array in memory
          this.value = undefined;
        }
      }
    }

    this.parser.onError = function (err) {
      if(err.message.indexOf('Unexpected') > -1) {
        err.message = 'Invalid JSON (' + err.message + ')';
      }
      transform.emit('error', err);
    }
  }

  /**
   * Main function that send data to the parse to be processed.
   *
   * @param {Buffer} chunk Incoming data
   * @param {String} encoding Encoding of the incoming data. Defaults to 'utf8'
   * @param {Function} done Called when the proceesing of the supplied chunk is done
   */
  _transform(chunk, encoding, done) {
    this.parser.write(chunk);
    done();
  }

  /**
   * Transforms an incoming json data to csv and pushes it downstream.
   *
   * @param {Object} data JSON object to be converted in a CSV row
   */
  pushLine(data) {
    const processedData = this.preprocessRow(data);
    
    if (!this._hasWritten) {
      this.params.fields = this.params.fields || Object.keys(processedData[0]);
      if (this.params.header) {
        const header = this.getHeader(this.params);
        this.emit('header', header);
        this.push(header);
        this._hasWritten = true;
      }
    }

    processedData.forEach(row => {
      const line = this.processRow(row, this.params);
      if (line === undefined) return;
      const eoledLine = (this._hasWritten ? this.params.eol : '')
        + line;
      this.emit('line', eoledLine);
      this.push(eoledLine);
      this._hasWritten = true;
    });
  }
}

module.exports = JSON2CSVTransform;
