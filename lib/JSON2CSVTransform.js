'use strict';

const Transform = require('stream').Transform;
const Parser = require('jsonparse');
const JSON2CSVBase = require('./JSON2CSVBase');

class JSON2CSVTransform extends Transform {
  constructor(opts, transformOpts) {
    super(transformOpts);

    // Inherit methods from JSON2CSVBase since extends doesn't
    // allow multiple inheritance and manually preprocess opts
    Object.getOwnPropertyNames(JSON2CSVBase.prototype)
      .forEach(key => (this[key] = JSON2CSVBase.prototype[key]));
    this.opts = this.preprocessOpts(opts);

    this._data = '';
    this._hasWritten = false;

    if (this._readableState.objectMode) {
      this.initObjectModeParse();
    } else if (this.opts.ndjson) {
      this.initNDJSONParse();
    } else {
      this.initJSONParser();
    }

    if (this.opts.withBOM) {
      this.push('\ufeff');
    }

    if (this.opts.fields) {
      this.opts.fields = this.preprocessFieldsInfo(this.opts.fields);
      this.pushHeader();
    }
  }

  /**
   * Init the transform with a parser to process data in object mode.
   * It receives JSON objects one by one and send them to `pushLine for processing.
   */
  initObjectModeParse() {
    const transform = this;

    this.parser = {
      write(line) {
        transform.pushLine(line);
      },
      getPendingData() {
        return undefined;
      }
    };
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

        let pendingData = false;
        lines
          .forEach((line, i) => {
            try {
              transform.pushLine(JSON.parse(line));
            } catch(e) {
              if (i === lines.length - 1) {
                pendingData = true;
              } else {
                e.message = 'Invalid JSON (' + line + ')'
                transform.emit('error', e);
              }
            }
          });
        this._data = pendingData
          ? this._data.slice(this._data.lastIndexOf('\n'))
          : '';
      },
      getPendingData() {
        return this._data;
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
        && !transform.opts.fields
        && this.mode !== Parser.C.ARRAY 
        && this.mode !== Parser.C.OBJECT) {
        this.onError(new Error('Data should not be empty or the "fields" option should be included'));
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

    this.parser.getPendingData = function () {
      return this.value;
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

  _flush(done) {
    if (this.parser.getPendingData()) {
      done(new Error('Invalid data received from stdin', this.parser.getPendingData()));
    }

    done();
  }


  /**
   * Generate the csv header and pushes it downstream.
   */
  pushHeader() {
    if (this.opts.header) {
      const header = this.getHeader();
      this.emit('header', header);
      this.push(header);
      this._hasWritten = true;
    }
  }

  /**
   * Transforms an incoming json data to csv and pushes it downstream.
   *
   * @param {Object} data JSON object to be converted in a CSV row
   */
  pushLine(data) {
    const processedData = this.preprocessRow(data);
    
    if (!this._hasWritten) {
      this.opts.fields = this.opts.fields || this.preprocessFieldsInfo(Object.keys(processedData[0]));
      this.pushHeader();
    }

    processedData.forEach(row => {
      const line = this.processRow(row, this.opts);
      if (line === undefined) return;
      const eoledLine = (this._hasWritten ? this.opts.eol : '')
        + line;
      this.emit('line', line);
      this.push(eoledLine);
      this._hasWritten = true;
    });
  }
}

module.exports = JSON2CSVTransform;
