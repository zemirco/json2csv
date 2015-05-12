'use strict';

var fs = require('fs');
var test = require('tape');
var async = require('async');
var json2csv = require('.././lib/json2csv');

var _in = require('./fixtures/in'),
  _in_quotes = require('./fixtures/in-quotes'),
  _out = '',
  _out_withoutTitle = '',
  _out_withNotExistField = '',
  _out_quotes = '',
  _out_selected = '',
  _out_reversed = '',
  _out_tsv = '',
  _out_eol = '',
  _out_fieldNames = '';

async.parallel([
  function(callback) {
    fs.readFile('test/fixtures/out.csv', function(err, data) {
      if (err) callback(err);
      _out = data.toString();
      callback(null);
    });
  },
  function(callback) {
    fs.readFile('test/fixtures/out-withoutTitle.csv', function(err, data) {
      if (err) callback(err);
      _out_withoutTitle = data.toString();
      callback(null);
    });
  },
  function(callback) {
    fs.readFile('test/fixtures/out-withNotExistField.csv', function(err, data) {
      if (err) callback(err);
      _out_withNotExistField = data.toString();
      callback(null);
    });
  },
  function(callback) {
    fs.readFile('test/fixtures/out-quotes.csv', function(err, data) {
      if (err) callback(err);
      _out_quotes = data.toString();
      callback(null);
    });
  },
  function(callback) {
    fs.readFile('test/fixtures/out-selected.csv', function(err, data) {
      if (err) callback(err);
      _out_selected = data.toString();
      callback(null);
    });
  },
  function(callback) {
    fs.readFile('test/fixtures/out-reversed.csv', function(err, data) {
      if (err) callback(err);
      _out_reversed = data.toString();
      callback(null);
    });
  },
  function(callback) {
    fs.readFile('test/fixtures/out.tsv', function(err, data) {
      if (err) callback(err);
      _out_tsv = data.toString();
      callback(null);
    });
  },
  function(callback) {
    fs.readFile('test/fixtures/out-eol.csv', function(err, data) {
      if (err) callback(err);
      _out_eol = data.toString();
      callback(null);
    });
  },
  function(callback) {
    fs.readFile('test/fixtures/out-fieldNames.csv', function(err, data) {
      if (err) callback(err);
      _out_fieldNames = data.toString();
      callback(null);
    });
  }
],
function(err, results) {
  if (err) console.log(err);

  test('should parse json to csv', function(t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price', 'color']
    }, function(err, csv) {
      t.equal(csv, _out);
      t.end();
    });
  });

  test('should parse json to csv without column title', function(t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price', 'color'],
      hasCSVColumnTitle: false
    }, function(err, csv) {
      t.equal(csv, _out_withoutTitle);
      t.end();
    });
  });

  test('should parse data:{} to csv with only column title', function(t) {
    json2csv({
      data: {},
      fields: ['carModel', 'price', 'color']
    }, function(err, csv) {
      t.equal(csv, '"carModel","price","color"');
      t.end();
    });
  });

  test('should parse data:[null] to csv with only column title', function(t) {
    json2csv({
      data: [null],
      fields: ['carModel', 'price', 'color']
    }, function(err, csv) {
      t.equal(csv, '"carModel","price","color"');
      t.end();
    });
  });

  test('should output only selected fields', function(t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price']
    }, function(err, csv) {
      t.equal(csv, _out_selected);
      t.end();
    });
  });

  test('should output not exist field with empty value', function(t) {
    json2csv({
      data: _in,
      fields: ['first not exist field', 'carModel', 'price', 'not exist field', 'color']
    }, function(err, csv) {
      t.equal(csv, _out_withNotExistField);
      t.end();
    });
  });

  test('should output reversed order', function(t) {
    json2csv({
      data: _in,
      fields: ['price', 'carModel']
    }, function(err, csv) {
      t.equal(csv, _out_reversed);
      t.end();
    });
  });

  test('should output a string', function(t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price', 'color']
    }, function(err, csv) {
      t.ok(typeof csv === 'string');
      t.end();
    });
  });

  test('should escape quotes with double quotes', function(t) {
    json2csv({
      data: _in_quotes,
      fields: ['a string']
    }, function(err, csv) {
      t.equal(csv, _out_quotes);
      t.end();
    });
  });

  test('should use a custom delimiter when \'del\' property is present', function(t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price', 'color'],
      del: '\t'
    }, function(err, csv) {
      t.equal(csv, _out_tsv);
      t.end();
    });
  });

  test('should use a custom eol character when \'eol\' property is present', function(t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price', 'color'],
      eol: ';'
    }, function(err, csv) {
      t.equal(csv, _out_eol);
      t.end();
    })
  });

  test('should name columns as specified in \'fieldNames\' property', function(t) {
    json2csv({
      data: _in,
      fields: ['carModel', 'price'],
      fieldNames: ['Car Model', 'Price USD']
    }, function(err, csv) {
      t.equal(csv, _out_fieldNames);
      t.end();
    })
  });
});


