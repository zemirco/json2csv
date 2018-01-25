'use strict';

const test = require('tape');
const json2csv = require('../lib/json2csv');
const parseLdJson = require('../lib/parse-ldjson');
const loadFixtures = require('./helpers/load-fixtures');

Promise.all([loadFixtures.loadJSON(), loadFixtures.loadCSV()])
.then((fixtures) => {
  const jsonFixtures = fixtures[0];
  const csvFixtures = fixtures[1];

  test('should output a string', (t) => {
    const csv = json2csv(jsonFixtures.default);

    t.ok(typeof csv === 'string');
    t.equal(csv, csvFixtures.default);
    t.end();
  });

  test('should remove last delimiter |@|', (t) => {
    let csv = json2csv([
      { firstname: 'foo', lastname: 'bar', email: 'foo.bar@json2csv.com' },
      { firstname: 'bar', lastname: 'foo', email: 'bar.foo@json2csv.com' }
    ], {
      delimiter: '|@|'
    });

    t.equal(csv, csvFixtures.delimiter);
    t.end();
  });

  test('should parse json to csv', (t) => {
    const csv = json2csv(jsonFixtures.default, {
      fields: ['carModel', 'price', 'color', 'transmission']
    });

    t.equal(csv, csvFixtures.default);
    t.end();
  });

  test('should parse json to csv without fields', (t) => {
    const csv = json2csv(jsonFixtures.default);

    t.equal(csv, csvFixtures.default);
    t.end();
  });

  test('should parse json to csv without column title', (t) => {
    const csv = json2csv(jsonFixtures.default, {
      fields: ['carModel', 'price', 'color'],
      header: false
    });

    t.equal(csv, csvFixtures.withoutTitle);
    t.end();
  });

  test('should parse json to csv even if json include functions', (t) => {
    const csv = json2csv({
      a: 1,
      funct: (a) => a + 1
    });

    t.equal(csv, '"a","funct"\n1,');
    t.end();
  });

  test('should parse data:{} to csv with only column title', (t) => {
    const csv = json2csv({}, {
      fields: ['carModel', 'price', 'color']
    });

    t.equal(csv, '"carModel","price","color"');
    t.end();
  });

  test('should parse data:[null] to csv with only column title', (t) => {
    const csv = json2csv([null], {
      fields: ['carModel', 'price', 'color']
    });

    t.equal(csv, '"carModel","price","color"');
    t.end();
  });

  test('should output only selected fields', (t) => {
    const csv = json2csv(jsonFixtures.default, {
      fields: ['carModel', 'price']
    });

    t.equal(csv, csvFixtures.selected);
    t.end();
  });

  test('should output not exist field with empty value', (t) => {
    const csv = json2csv(jsonFixtures.default, {
      fields: ['first not exist field', 'carModel', 'price', 'not exist field', 'color']
    });

    t.equal(csv, csvFixtures.withNotExistField);
    t.end();
  });

  test('should output reversed order', (t) => {
    const csv = json2csv(jsonFixtures.default, {
      fields: ['price', 'carModel']
    });

    t.equal(csv, csvFixtures.reversed);
    t.end();
  });

  test('should escape quotes with double quotes', (t) => {
    const csv = json2csv(jsonFixtures.quotes, {
      fields: ['a string']
    });

    t.equal(csv, csvFixtures.quotes);
    t.end();
  });

  test('should escape quotes with value in doubleQuote', (t) => {
    const csv = json2csv(jsonFixtures.doubleQuotes, {
      fields: ['a string'],
      doubleQuote: '*'
    });

    t.equal(csv, csvFixtures.doubleQuotes);
    t.end();
  });

  test('should not escape quotes with double quotes, when there is a backslah in the end', (t) => {
    const csv = json2csv(jsonFixtures.backslashAtEnd, {
      fields: ['a string']
    });

    t.equal(csv, csvFixtures.backslashAtEnd);
    t.end();
  });

  test('should not escape quotes with double quotes, when there is a backslah in the end, and its not the last column', (t) => {
    const csv = json2csv(jsonFixtures.backslashAtEndInMiddleColumn, {
      fields: ['uuid','title','id']
    });

    t.equal(csv, csvFixtures.backslashAtEndInMiddleColumn);
    t.end();
  });

  test('should use a custom delimiter when \'quote\' property is present', (t) => {
    const csv = json2csv(jsonFixtures.default, {
      fields: ['carModel', 'price'],
      quote: '\''
    });

    t.equal(csv, csvFixtures.withSimpleQuotes);
    t.end();
  });

  test('should be able to don\'t output quotes when using \'quote\' property', (t) => {
    const csv = json2csv(jsonFixtures.default, {
      fields: ['carModel', 'price'],
      quote: ''
    });

    t.equal(csv, csvFixtures.withoutQuotes);
    t.end();
  });

  test('should use a custom delimiter when \'delimiter\' property is present', (t) => {
    const csv = json2csv(jsonFixtures.default, {
      fields: ['carModel', 'price', 'color'],
      delimiter: '\t'
    });

    t.equal(csv, csvFixtures.tsv);
    t.end();
  });

  test('should use a custom eol character when \'eol\' property is present', (t) => {
    const csv = json2csv(jsonFixtures.default, {
      fields: ['carModel', 'price', 'color'],
      eol: '\r\n'
    });

    t.equal(csv, csvFixtures.eol);
    t.end();
  });

  test('should name columns as specified in \'fields\' property', (t) => {
    const csv = json2csv(jsonFixtures.default, {
      fields: [{
        label: 'Car Model',
        value: 'carModel'
      },{
        label: 'Price USD',
        value: 'price'
      }]
    });
    
    t.equal(csv, csvFixtures.fieldNames);
    t.end();
  });

  test('should output nested properties', (t) => {
    const csv = json2csv(jsonFixtures.nested, {
      fields: [{
        label: 'Make',
        value: 'car.make'
      },{
        label: 'Model',
        value: 'car.model'
      },{
        label: 'Price',
        value: 'price'
      },{
        label: 'Color',
        value: 'color'
      },{
        label: 'Year',
        value: 'car.ye.ar'
      }]
    });

    t.equal(csv, csvFixtures.nested);
    t.end();
  });

  test('should output default values when missing data', (t) => {
    const csv = json2csv(jsonFixtures.defaultValue, {
      fields: ['carModel', 'price'],
      defaultValue: 'NULL'
    });

    t.equal(csv, csvFixtures.defaultValue);
    t.end();
  });

  test('should output default values when default value is set to empty string', (t) => {
    const csv = json2csv(jsonFixtures.defaultValueEmpty, {
      fields: ['carModel', 'price'],
      defaultValue: ''
    });

    t.equal(csv, csvFixtures.defaultValueEmpty);
    t.end();
  });

  test('should error asynchronously if params is not an object', function (t) {
    let csv;

    try {
      csv = json2csv('not an object', {
        fields: ['carModel']
      });

      t.notOk(true);
    } catch(error) {
      t.equal(error.message, 'params should include "fields" and/or non-empty "data" array of objects');
      t.notOk(csv);
      t.end();
    }
  });

  test('should handle embedded JSON', (t) => {
    const csv = json2csv({'field1': {embeddedField1: 'embeddedValue1', embeddedField2: 'embeddedValue2'}});

    t.equal(csv, csvFixtures.embeddedjson);
    t.end();
  });

  test('should handle date', (t) => {
    const csv = json2csv({'date': new Date("2017-01-01T00:00:00.000Z")});

    t.equal(csv, csvFixtures.date);
    t.end();
  });

  test('should flatten embedded JSON', (t) => {
    const csv = json2csv({
      field1: {
        embeddedField1: 'embeddedValue1',
        embeddedField2: 'embeddedValue2'
      }
    }, {
      flatten: true
    });

    t.equal(csv, csvFixtures.flattenedEmbeddedJson);
    t.end();
  });

  test('should process fancy fields option', (t) => {
    const csv = json2csv([{
      path1: 'hello ',
      path2: 'world!',
      bird: {
        nest1: 'chirp',
        nest2: 'cheep'
      },
      fake: {
        path: 'overrides default'
      }
    }, {
      path1: 'good ',
      path2: 'bye!',
      bird: {
        nest1: 'meep',
        nest2: 'meep'
      }
    }],{
      fields: [{
        label: 'PATH1',
        value: 'path1'
      }, {
        label: 'PATH1+PATH2',
        value: row => row.path1+row.path2
      }, {
        label: 'NEST1',
        value: 'bird.nest1'
      },
      'bird.nest2',
      {
        label: 'nonexistent',
        value: 'fake.path',
        default: 'col specific default value'
      }],
      defaultValue: 'NULL'
    });

    t.equal(csv, csvFixtures.fancyfields);
    t.end();
  });

  test('function value should stringify results by default', (t) => {
    const csv = json2csv([{
      value1: 'abc'
    }, {
      value1: '1234'
    }], {
      fields: [{
        label: 'Value1',
        value: row => row.value1.toLocaleString()
      }]
    });
    
    t.equal(csv, csvFixtures.functionStringifyByDefault);
    t.end();
  });

  test('function value do not stringify', (t) => {
    const csv = json2csv([{
      value1: '"abc"'
    }, {
      value1: '1234'
    }], {
      fields: [{
        label: 'Value1',
        value: row => row.value1.toLocaleString(),
        stringify: false
      }]
    });

    t.equal(csv, csvFixtures.functionNoStringify);
    t.end();
  });

  test('should parse JSON values with trailing backslashes', (t) => {
    const csv = json2csv(jsonFixtures.trailingBackslash, {
      fields: ['carModel', 'price', 'color']
    });

    t.equal(csv, csvFixtures.trailingBackslash);
    t.end();
  });

  test('should escape " when preceeded by \\', (t) => {
    const csv = json2csv([{field: '\\"'}], {
      eol: '\n'
    });

    t.equal(csv, '"field"\n"\\"""');
    t.end();
  });

  test('should format strings to force excel to view the values as strings', (t) => {
    const csv = json2csv(jsonFixtures.default, {
      excelStrings:true,
      fields: ['carModel', 'price', 'color']
    });

    t.equal(csv, csvFixtures.excelStrings);
    t.end();
  });

  test('should override defaultValue with field.defaultValue', (t) => {
    const csv = json2csv(jsonFixtures.overriddenDefaultValue, {
      fields: [
        {
          value: 'carModel',
        },
        {
          value: 'price',
          default: 1
        },
        {
          value: 'color',
        }
      ],
      defaultValue: ''
    });

    t.equal(csv, csvFixtures.overriddenDefaultValue);
    t.end();
  });

  test('should use options.defaultValue when using function with no field.default', (t) => {
    const csv = json2csv(jsonFixtures.overriddenDefaultValue, {
      fields: [
        {
          value: 'carModel',
        },
        {
          label: 'price',
          value: row => row.price,
          default: 1
        },
        {
          label: 'color',
          value: row => row.color,
        }
      ],
      defaultValue: ''
    });

    t.equal(csv, csvFixtures.overriddenDefaultValue);
    t.end();
  });

  test('should include empty rows when options.includeEmptyRows is true', (t) => {
    const csv = json2csv(jsonFixtures.emptyRow, {
      fields: [
        {
          value: 'carModel',
        },
        {
          label: 'price',
          value: row => row.price,
        },
        {
          label: 'color',
          value: (row) => row.color,
        }
      ],
      includeEmptyRows: true,
    });

    t.equal(csv, csvFixtures.emptyRow);
    t.end();
  });

  test('should not include empty rows when options.includeEmptyRows is false', (t) => {
    const csv = json2csv(jsonFixtures.emptyRow, {
      fields: [
        {
          value: 'carModel',
        },
        {
          label: 'price',
          value: row => row.price,
        },
        {
          label: 'color',
          value: row => row.color,
        }
      ],
      includeEmptyRows: false,
    });

    t.equal(csv, csvFixtures.emptyRowNotIncluded);
    t.end();
  });

  test('should not include empty rows when options.includeEmptyRows is not specified', (t) => {
    const csv = json2csv(jsonFixtures.emptyRow, {
      fields: [
        {
          value: 'carModel',
        },
        {
          label: 'price',
          value: row => row.price,
        },
        {
          label: 'color',
          value: row => row.color,
        }
      ],
    });

    t.equal(csv, csvFixtures.emptyRowNotIncluded);
    t.end();
  });

  test('should include empty rows when options.includeEmptyRows is true, with default values', (t) => {
    const csv = json2csv(jsonFixtures.emptyRow, {
      fields: [
        {
          value: 'carModel',
        },
        {
          label: 'price',
          value: row => row.price,
          default: 1
        },
        {
          label: 'color',
          value: row => row.color,
        }
      ],
      defaultValue: 'NULL',
      includeEmptyRows: true,
    });

    t.equal(csv, csvFixtures.emptyRowDefaultValues);
    t.end();
  });

  test('should parse data:[null] to csv with only column title, despite options.includeEmptyRows', (t) => {
    const csv = json2csv([null], {
      fields: ['carModel', 'price', 'color'],
      includeEmptyRows: true,
    });

    t.equal(csv, '"carModel","price","color"');
    t.end();
  });

  test('should unwind an array into multiple rows', (t) => {
    const csv = json2csv(jsonFixtures.unwind, {
      fields: ['carModel', 'price', 'colors'],
      unwind: 'colors'
    });

    t.equal(csv, csvFixtures.unwind);
    t.end();
  });

  test('should unwind twice an array into multiple rows', (t) => {
    const csv = json2csv(jsonFixtures.unwind2, {
      fields: ['carModel', 'price', 'items.name', 'items.color', 'items.items.position', 'items.items.color'],
      unwind: ['items', 'items.items']
    });

    t.equal(csv, csvFixtures.unwind2);
    t.end();
  });

  test('should unwind and flatten an array into multiple rows', (t) => {
    const csv = json2csv(jsonFixtures.unwindAndFlatten, {
      unwind: ['items'],
      flatten: true
    });

    t.equal(csv, csvFixtures.unwindAndFlatten);
    t.end();
  });

  test('should preserve new lines in values', (t) => {
    const csv = json2csv(jsonFixtures.eol, {
      fields: ['a string'],
      eol: '\r\n'
    });

    t.equal(csv, [
      '"a string"',
      '"with a \ndescription\\n and\na new line"',
      '"with a \r\ndescription and\r\nanother new line"'
    ].join('\r\n'));
    t.end();
  });

  test('should add BOM character', (t) => {
    const csv = json2csv(jsonFixtures.specialCharacters, {
      withBOM: true
    });

    // Compare csv length to check if the BOM character is present
    t.equal(csv.length, csvFixtures.default.length + 1);
    t.equal(csv.length, csvFixtures.withBOM.length);
    t.end();
  });

  // ================================================================
  // Test for parseLdJson
  // 

  test('should parse line-delimited JSON', (t) => {
    const input = '{"foo":"bar"}\n{"foo":"qux"}';

    const parsed = parseLdJson(input);

    t.equal(parsed.length, 2, 'parsed input has correct length');
    t.end();
  });
}).catch(console.log); // eslint-disable-line no-console
