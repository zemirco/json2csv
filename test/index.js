'use strict';

var test = require('tape');
var async = require('async');
var json2csv = require('../lib/json2csv');
var loadFixtures = require('./helpers/load-fixtures');
var jsonDefault = require('./fixtures/json/default');
var jsonQuotes = require('./fixtures/json/quotes');
var jsonNested = require('./fixtures/json/nested');
var jsonDefaultValue = require('./fixtures/json/defaultValue');
var csvFixtures = {};

async.parallel(loadFixtures(csvFixtures), function (err) {
  if (err) {
    /*eslint-disable no-console*/
    console.log(err);
    /*eslint-enable no-console*/
  }

  test('should throw if no callback', function (t) {
    t.throws(function () {
      json2csv({
        data: jsonDefault
      });
    }, /Callback is required/);
    t.end();
  });

  test('should error if fieldNames don\'t line up to fields', function (t) {
    json2csv({
      data: jsonDefault,
      field: ['carModel'],
      fieldNames: ['test', 'blah']
    }, function (error, csv) {
      t.equal(error.message, 'fieldNames and fields should be of the same length, if fieldNames is provided.');
      t.notOk(csv);
      t.end();
    });
  });

  test('should parse json to csv', function (t) {
    json2csv({
      data: jsonDefault,
      fields: ['carModel', 'price', 'color']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.default);
      t.end();
    });
  });

  test('should parse json to csv without fields', function (t) {
    json2csv({
      data: jsonDefault
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.default);
      t.end();
    });
  });

  test('should parse json to csv without column title', function (t) {
    json2csv({
      data: jsonDefault,
      fields: ['carModel', 'price', 'color'],
      hasCSVColumnTitle: false
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.withoutTitle);
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
      data: jsonDefault,
      fields: ['carModel', 'price']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.selected);
      t.end();
    });
  });

  test('should output not exist field with empty value', function (t) {
    json2csv({
      data: jsonDefault,
      fields: ['first not exist field', 'carModel', 'price', 'not exist field', 'color']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.withNotExistField);
      t.end();
    });
  });

  test('should output reversed order', function (t) {
    json2csv({
      data: jsonDefault,
      fields: ['price', 'carModel']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.reversed);
      t.end();
    });
  });

  test('should output a string', function (t) {
    json2csv({
      data: jsonDefault,
      fields: ['carModel', 'price', 'color']
    }, function (error, csv) {
      t.error(error);
      t.ok(typeof csv === 'string');
      t.end();
    });
  });

  test('should escape quotes with double quotes', function (t) {
    json2csv({
      data: jsonQuotes,
      fields: ['a string']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.quotes);
      t.end();
    });
  });

  test('should use a custom delimiter when \'quotes\' property is present', function (t) {
    json2csv({
      data: jsonDefault,
      fields: ['carModel', 'price'],
      quotes: '\''
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.withSimpleQuotes);
      t.end();
    });
  });

  test('should be able to don\'t output quotes when using \'quotes\' property', function (t) {
    json2csv({
      data: jsonDefault,
      fields: ['carModel', 'price'],
      quotes: ''
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.withoutQuotes);
      t.end();
    });
  });

  test('should use a custom delimiter when \'del\' property is present', function (t) {
    json2csv({
      data: jsonDefault,
      fields: ['carModel', 'price', 'color'],
      del: '\t'
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.tsv);
      t.end();
    });
  });

  test('should use a custom eol character when \'eol\' property is present', function (t) {
    json2csv({
      data: jsonDefault,
      fields: ['carModel', 'price', 'color'],
      eol: ';'
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.eol);
      t.end();
    });
  });

  test('should use a custom newLine character when the \'newLine\' property is present', function (t) {
    json2csv({
      data: jsonDefault,
      fields: ['carModel', 'price', 'color'],
      newLine: '\r\n'
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.newLine);
      t.end();
    });
  });

  test('should name columns as specified in \'fieldNames\' property', function (t) {
    json2csv({
      data: jsonDefault,
      fields: ['carModel', 'price'],
      fieldNames: ['Car Model', 'Price USD']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.fieldNames);
      t.end();
    });
  });

  test('should output nested properties', function (t) {
    json2csv({
      data: jsonNested,
      fields: ['car.make', 'car.model', 'price', 'color', 'car.ye.ar'],
      fieldNames: ['Make', 'Model', 'Price', 'Color', 'Year'],
      nested: true
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.nested);
      t.end();
    });
  });

  test('should output default values when missing data', function (t) {
    json2csv({
      data: jsonDefaultValue,
      fields: ['carModel', 'price'],
      defaultValue: 'NULL'
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.defaultValue);
      t.end();
    });
  });
});
