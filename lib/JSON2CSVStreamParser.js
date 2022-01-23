const JSON2CSVBase = require("./JSON2CSVBase");
const { Tokenizer, TokenParser, TokenType } = require('@streamparser/json');

class JSON2CSVStreamParser extends JSON2CSVBase {
  constructor(opts, asyncOpts) {
    super(opts);
    this.opts = this.preprocessOpts(opts);
    this.initTokenizer(opts, asyncOpts);
    if (this.opts.fields) this.preprocessFieldsInfo(this.opts.fields);
  }

  initTokenizer(opts = {}, asyncOpts = {}) {
    if (asyncOpts.objectMode) {
      this.tokenizer = this.getObjectModeTokenizer();
      return;
    }

    if (opts.ndjson) {
      this.tokenizer = this.getNdJsonTokenizer(asyncOpts);
      return;
    }

    this.tokenizer = this.getBinaryModeTokenizer(asyncOpts);
    return;
  }

  getObjectModeTokenizer() {
    return {
      write: (data) => this.pushLine(data),
      end: () => {
        this.pushHeaderIfNotWritten();
        this.onEnd();
      },
    };
  }

  configureCallbacks(tokenizer, tokenParser) {
    tokenizer.onToken = tokenParser.write.bind(this.tokenParser);
    tokenizer.onError = (err) => this.onError(err);
    tokenizer.onEnd = () => {
      if (!this.tokenParser.isEnded) this.tokenParser.end();
    };

    tokenParser.onValue = (value) => this.pushLine(value);
    tokenParser.onError = (err) => this.onError(err);
    tokenParser.onEnd = () => {
      this.pushHeaderIfNotWritten();
      this.onEnd();
    };
  }

  getNdJsonTokenizer(asyncOpts) {
    const tokenizer = new Tokenizer({ ...asyncOpts, separator: '\n' });
    this.tokenParser = new TokenParser({ paths: ['$'], keepStack: false, separator: '\n' });
    this.configureCallbacks(tokenizer, this.tokenParser);
    return tokenizer;
  }

  getBinaryModeTokenizer(asyncOpts) {
    const tokenizer = new Tokenizer(asyncOpts);
    tokenizer.onToken = (token, value, offset) => {
      if (token === TokenType.LEFT_BRACKET) {
        this.tokenParser = new TokenParser({ paths: ['$.*'], keepStack: false });
      } else if (token === TokenType.LEFT_BRACE) {
        this.tokenParser = new TokenParser({ paths: ['$'], keepStack: false });
      } else {
        this.onError(new Error('Data should be a JSON object or array'));
        return;
      }

      this.configureCallbacks(tokenizer, this.tokenParser);

      this.tokenParser.write(token, value, offset);
    };
    tokenizer.onError = () => this.onError(new Error('Data should be a JSON object or array'));
    tokenizer.onEnd = () => {
      this.onError(new Error('Data should not be empty or the "fields" option should be included'));
      this.onEnd();
    };
  
    return tokenizer;
  }

  write(data) {
    this.tokenizer.write(data);
  }

  end() {
    if (this.tokenizer && !this.tokenizer.isEnded) this.tokenizer.end();
  }

  pushHeaderIfNotWritten() {
    if (this._hasWritten) return;
    if (!this.opts.fields) {
      this.onError(new Error('Data should not be empty or the "fields" option should be included'));
      return;
    }

    this.pushHeader();
  }

  /**
   * Generate the csv header and pushes it downstream.
   */
  pushHeader() {
    if (this.opts.withBOM) {
      this.onData('\ufeff');
    }
  
    if (this.opts.header) {
      const header = this.getHeader(this.opts.fields);
      this.onHeader(header);
      this.onData(header);
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
      this.opts.fields = this.preprocessFieldsInfo(this.opts.fields || Object.keys(processedData[0]));
      this.pushHeader(this.opts.fields);
    }

    processedData.forEach(row => {
      const line = this.processRow(row, this.opts.fields);
      if (line === undefined) return;
      this.onLine(line);
      this.onData(this._hasWritten ? this.opts.eol + line : line);
      this._hasWritten = true;
    });
  }

  // No idea why eslint doesn't detect the usage of these
  /* eslint-disable no-unused-vars */
  onHeader(header) {}
  onLine(line) {}
  onData(data) {}
  onError() {}
  onEnd() {}
  /* eslint-enable no-unused-vars */
}

module.exports = JSON2CSVStreamParser;
