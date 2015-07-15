'use strict';

var fs = require('fs');
var test = require('tape');
var async = require('async');
var json2csv = require('.././lib/json2csv');

var _in = require('./fixtures/in');
var _inQuotes = require('./fixtures/in-quotes');
var _inNested = require('./fixtures/in-nested');
var _out = '';
var _outWithoutTitle = '';
var _outWithNotExistField = '';
var _outQuotes = '';
var _outNested = '';
var _outSelected = '';
var _outReversed = '';
var _outTsv = '';
var _outEol = '';
var _outFieldNames = '';
var _outWithoutQuotes = '';
var _outWithSimpleQuotes = '';

async.parallel([
  function (callback) {
    fs.readFile('test/fixtures/out.csv', function (err, data) {
      if (err) {
        callback(err);
      }

      _out = data.toString();
      callback(null);
    });
  },
  function (callback) {
    fs.readFile('test/fixtures/out-withoutTitle.csv', function (err, data) {
      if (err) {
        callback(err);
      }

      _outWithoutTitle = data.toString();
      callback(null);
    });
  },
  function (callback) {
    fs.readFile('test/fixtures/out-withNotExistField.csv', function (err, data) {
      if (err) {
        callback(err);
      }

      _outWithNotExistField = data.toString();
      callback(null);
    });
  },
  function (callback) {
    fs.readFile('test/fixtures/out-quotes.csv', function (err, data) {
      if (err) {
        callback(err);
      }

      _outQuotes = data.toString();
      callback(null);
    });
  },
  function (callback) {
    fs.readFile('test/fixtures/out-selected.csv', function (err, data) {
      if (err) {
        callback(err);
      }

      _outSelected = data.toString();
      callback(null);
    });
  },
  function (callback) {
    fs.readFile('test/fixtures/out-reversed.csv', function (err, data) {
      if (err) {
        callback(err);
      }

      _outReversed = data.toString();
      callback(null);
    });
  },
  function (callback) {
    fs.readFile('test/fixtures/out.tsv', function (err, data) {
      if (err) {
        callback(err);
      }

      _outTsv = data.toString();
      callback(null);
    });
  },
  function (callback) {
    fs.readFile('test/fixtures/out-eol.csv', function (err, data) {
      if (err) {
        callback(err);
      }

      _outEol = data.toString();
      callback(null);
    });
  },
  function (callback) {
    fs.readFile('test/fixtures/out-fieldNames.csv', function (err, data) {
      if (err) {
        callback(err);
      }

      _outFieldNames = data.toString();
      callback(null);
    });
  },
  function (callback) {
    fs.readFile('test/fixtures/out-withoutQuotes.csv', function (err, data) {
      if (err) {
        callback(err);
      }

      _outWithoutQuotes = data.toString();
      callback(null);
    });
  },
  function (callback) {
    fs.readFile('test/fixtures/out-withSimpleQuotes.csv', function (err, data) {
      if (err) {
        callback(err);
      }

      _outWithSimpleQuotes = data.toString();
      callback(null);
    });
  },
  function (callback) {
    fs.readFile('test/fixtures/out-nested.csv', function (err, data) {
      if (err) callback(err);
      _outNested = data.toString();
      callback(null);
    });
  }
],
function (err) {
  if (err) {
    /*eslint-disable no-console*/
    console.log(err);
    /*eslint-enable no-console*/
  }

  test('should parse json to csv', function (t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price', 'color']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, _out);
      t.end();
    });
  });

  test('should parse json to csv without column title', function (t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price', 'color'],
      hasCSVColumnTitle: false
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, _outWithoutTitle);
      t.end();
    });
  });

  test('should parse data:{} to csv with only column title', function (t) {
    json2csv({
      data: {},
      fields: ['carModel', 'price', 'color']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, '"carModel","price","color"');
      t.end();
    });
  });

  test('should parse data:[null] to csv with only column title', function (t) {
    json2csv({
      data: [null],
      fields: ['carModel', 'price', 'color']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, '"carModel","price","color"');
      t.end();
    });
  });

  test('should output only selected fields', function (t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, _outSelected);
      t.end();
    });
  });

  test('should output not exist field with empty value', function (t) {
    json2csv({
      data: _in,
      fields: ['first not exist field', 'carModel', 'price', 'not exist field', 'color']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, _outWithNotExistField);
      t.end();
    });
  });

  test('should output reversed order', function (t) {
    json2csv({
      data: _in,
      fields: ['price', 'carModel']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, _outReversed);
      t.end();
    });
  });

  test('should output a string', function (t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price', 'color']
    }, function (error, csv) {
      t.error(error);
      t.ok(typeof csv === 'string');
      t.end();
    });
  });

  test('should escape quotes with double quotes', function (t) {
    json2csv({
      data: _inQuotes,
      fields: ['a string']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, _outQuotes);
      t.end();
    });
  });

  test('should use a custom delimiter when \'quotes\' property is present', function (t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price'],
      quotes: '\''
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, _outWithSimpleQuotes);
      t.end();
    });
  });

  test('should be able to don\'t output quotes when using \'quotes\' property', function (t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price'],
      quotes: ''
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, _outWithoutQuotes);
      t.end();
    });
  });

  test('should use a custom delimiter when \'del\' property is present', function (t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price', 'color'],
      del: '\t'
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, _outTsv);
      t.end();
    });
  });

  test('should use a custom eol character when \'eol\' property is present', function (t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price', 'color'],
      eol: ';'
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, _outEol);
      t.end();
    });
  });

  test('should name columns as specified in \'fieldNames\' property', function (t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price'],
      fieldNames: ['Car Model', 'Price USD']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, _outFieldNames);
      t.end();
    });
  });

  test('should output nested properties', function (t) {
    json2csv({
      data: _inNested,
      fields: ['car.make', 'car.model', 'price', 'color', 'car.ye.ar'],
      fieldNames: ['Make', 'Model', 'Price', 'Color', 'Year']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, _outNested);
      t.end();
    })
  });
});
