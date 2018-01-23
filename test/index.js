'use strict';

var test = require('tape');
var json2csv = require('../lib/json2csv');
var parseLdJson = require('../lib/parse-ldjson');
var loadFixtures = require('./helpers/load-fixtures');
var jsonDefault = require('./fixtures/json/default');
var jsonQuotes = require('./fixtures/json/quotes');
var backslashAtEnd = require('./fixtures/json/backslashAtEnd');
var backslashAtEndInMiddleColumn = require('./fixtures/json/backslashAtEndInMiddleColumn');
var jsonNested = require('./fixtures/json/nested');
var jsonDefaultValue = require('./fixtures/json/defaultValue');
var jsonDefaultValueEmpty = require('./fixtures/json/defaultValueEmpty');
var jsonTrailingBackslash = require('./fixtures/json/trailingBackslash');
var jsonOverriddenDefaultValue = require('./fixtures/json/overridenDefaultValue');
var jsonEmptyRow = require('./fixtures/json/emptyRow');
var jsonUnwind = require('./fixtures/json/unwind');
var jsonUnwind2 = require('./fixtures/json/unwind2');
var jsonEOL = require('./fixtures/json/eol');
var jsonSpecialCharacters = require('./fixtures/json/specialCharacters');

loadFixtures().then(function (csvFixtures) {
  test('should work synchronously', function (t) {
    var csv = json2csv({
      data: jsonDefault
    });
    t.equal(csv, csvFixtures.default);
    t.end();
  });

  test('should work asynchronously and not release zalgo', function (t) {
    var releasedZalgo = true;
    json2csv({
      data: jsonDefault
    }, function (err, csv) {
      t.equal(csv, csvFixtures.default);
      t.notOk(releasedZalgo);
      t.end();
    });

    releasedZalgo = false;
  });

  test('should work asynchronously and remove last delimiter |@|', function (t) {
    json2csv({
      data: [
        { firstname: 'foo', lastname: 'bar', email: 'foo.bar@json2csv.com' },
        { firstname: 'bar', lastname: 'foo', email: 'bar.foo@json2csv.com' }
      ],
      delimiter: '|@|'
    }, function (err, csv) {
      t.equal(csv, csvFixtures.delimiter);
      t.end();
    });
  });

  test('should error synchronously if fieldNames don\'t line up to fields', function (t) {
    var csv;
    try {
      csv = json2csv({
        data: jsonDefault,
        field: ['carModel'],
        fieldNames: ['test', 'blah']
      });
      t.notOk(true);
    } catch (error) {
      t.equal(error.message, 'fieldNames and fields should be of the same length, if fieldNames is provided.');
      t.notOk(csv);
      t.end();
    }
  });

  test('should error asynchronously if fieldNames don\'t line up to fields', function (t) {
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
      fields: ['carModel', 'price', 'color', 'transmission']
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
      header: false
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.withoutTitle);
      t.end();
    });
  });

  test('should parse json to csv even if json include functions', function (t) {
    json2csv({
      data: {
        a: 1,
        funct: function (a) {
          return a + 1;
        },
      }
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, '"a","funct"\n1,');
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


  test('should not escape quotes with double quotes, when there is a backslah in the end', function (t) {
    json2csv({
      data: backslashAtEnd,
      fields: ['a string']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.backslashAtEnd);
      t.end();
    });
  });


  test('should not escape quotes with double quotes, when there is a backslah in the end, and its not the last column', function (t) {
    json2csv({
      data: backslashAtEndInMiddleColumn,
      fields: ['uuid','title','id']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.backslashAtEndInMiddleColumn);
      t.end();
    });
  });

  test('should use a custom delimiter when \'quote\' property is present', function (t) {
    json2csv({
      data: jsonDefault,
      fields: ['carModel', 'price'],
      quote: '\''
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.withSimpleQuotes);
      t.end();
    });
  });

  test('should be able to don\'t output quotes when using \'quote\' property', function (t) {
    json2csv({
      data: jsonDefault,
      fields: ['carModel', 'price'],
      quote: ''
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.withoutQuotes);
      t.end();
    });
  });

  test('should use a custom delimiter when \'delimiter\' property is present', function (t) {
    json2csv({
      data: jsonDefault,
      fields: ['carModel', 'price', 'color'],
      delimiter: '\t'
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
      eol: '\r\n'
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.eol);
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
      fieldNames: ['Make', 'Model', 'Price', 'Color', 'Year']
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

  test('should output default values when default value is set to empty string', function (t) {
    json2csv({
      data: jsonDefaultValueEmpty,
      fields: ['carModel', 'price'],
      defaultValue: ''
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.defaultValueEmpty);
      t.end();
    });
  });

  test('should error if params is not an object', function (t) {
    json2csv({
      data: 'not an object',
      field: ['carModel'],
      fieldNames: ['test', 'blah']
    }, function (error, csv) {
      t.equal(error.message, 'params should include "fields" and/or non-empty "data" array of objects');
      t.notOk(csv);
      t.end();
    });
  });

  test('should parse line-delimited JSON', function (t) {
    var input = '{"foo":"bar"}\n{"foo":"qux"}';
    try {
      var parsed = parseLdJson(input);
      t.equal(parsed.length, 2, 'parsed input has correct length');
      t.end();
    } catch(e) {
      t.error(e);
      t.end();
    }
  });

  test('should handle embedded JSON', function (t) {
    json2csv({
      data: {'field1': {embeddedField1: 'embeddedValue1', embeddedField2: 'embeddedValue2'}}
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.embeddedjson);
      t.end();
    });
  });

  test('should handle date', function (t) {
    json2csv({
      data: {'date': new Date('2017-01-01T00:00:00.000Z')}
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.date);
      t.end();
    });
  });

  test('should flatten embedded JSON', function (t) {
    json2csv({
      data: {'field1': {embeddedField1: 'embeddedValue1', embeddedField2: 'embeddedValue2'}},
      flatten: true
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.flattenedEmbeddedJson);
      t.end();
    });
  });

  test('should process fancy fields option', function (t) {
    json2csv({
      data: [{
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
      }],
      fields: [{
        label: 'PATH1',
        value: 'path1'
      }, {
        label: 'PATH1+PATH2',
        value: function (row) {
          return row.path1+row.path2;
        }
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
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.fancyfields);
      t.end();
    });
  });

  test('function value should stringify results by default', function (t) {
    json2csv({
      data: [{
        value1: 'abc'
      }, {
        value1: '1234'
      }],
      fields: [{
        label: 'Value1',
        value: function (row) {
          return row.value1.toLocaleString();
        }
      }]
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.functionStringifyByDefault);
      t.end();
    });
  });

  test('function value do not stringify', function (t) {
    json2csv({
      data: [{
        value1: '"abc"'
      }, {
        value1: '1234'
      }],
      fields: [{
        label: 'Value1',
        value: function (row) {
          return row.value1.toLocaleString();
        },
        stringify: false
      }]
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.functionNoStringify);
      t.end();
    });
  });

  test('should parse JSON values with trailing backslashes', function (t) {
    json2csv({
      data: jsonTrailingBackslash,
      fields: ['carModel', 'price', 'color']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.trailingBackslash);
      t.end();
    });
  });

  test('should escape " when preceeded by \\', function (t){
    json2csv({
      data: [{field: '\\"'}],
      eol: '\n'
    }, function (error, csv){
      t.error(error);
      t.equal(csv, '"field"\n"\\"""');
      t.end();
    });
  });

  test('should format strings to force excel to view the values as strings', function (t) {
    json2csv({
      data: jsonDefault,
      excelStrings:true,
      fields: ['carModel', 'price', 'color']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.excelStrings);
      t.end();
    });
  });

  test('should override defaultValue with field.defaultValue', function (t) {
    json2csv({
      data: jsonOverriddenDefaultValue,
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
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.overriddenDefaultValue);
      t.end();
    });
  });

  test('should use options.defaultValue when using function with no field.default', function (t) {
    json2csv({
      data: jsonOverriddenDefaultValue,
      fields: [
        {
          value: 'carModel',
        },
        {
          label: 'price',
          value: function (row) {
            return row.price;
          },
          default: 1
        },
        {
          label: 'color',
          value: function (row) {
            return row.color;
          },
        }
      ],
      defaultValue: ''
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.overriddenDefaultValue);
      t.end();
    });
  });

  test('should include empty rows when options.includeEmptyRows is true', function (t) {
    json2csv({
      data: jsonEmptyRow,
      fields: [
        {
          value: 'carModel',
        },
        {
          label: 'price',
          value: function (row) {
            return row.price;
          },
        },
        {
          label: 'color',
          value: function (row) {
            return row.color;
          },
        }
      ],
      includeEmptyRows: true,
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.emptyRow);
      t.end();
    });
  });

  test('should not include empty rows when options.includeEmptyRows is false', function (t) {
    json2csv({
      data: jsonEmptyRow,
      fields: [
        {
          value: 'carModel',
        },
        {
          label: 'price',
          value: function (row) {
            return row.price;
          },
        },
        {
          label: 'color',
          value: function (row) {
            return row.color;
          },
        }
      ],
      includeEmptyRows: false,
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.emptyRowNotIncluded);
      t.end();
    });
  });

  test('should not include empty rows when options.includeEmptyRows is not specified', function (t) {
    json2csv({
      data: jsonEmptyRow,
      fields: [
        {
          value: 'carModel',
        },
        {
          label: 'price',
          value: function (row) {
            return row.price;
          },
        },
        {
          label: 'color',
          value: function (row) {
            return row.color;
          },
        }
      ],
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.emptyRowNotIncluded);
      t.end();
    });
  });

  test('should include empty rows when options.includeEmptyRows is true, with default values', function (t) {
    json2csv({
      data: jsonEmptyRow,
      fields: [
        {
          value: 'carModel',
        },
        {
          label: 'price',
          value: function (row) {
            return row.price;
          },
          default: 1
        },
        {
          label: 'color',
          value: function (row) {
            return row.color;
          },
        }
      ],
      defaultValue: 'NULL',
      includeEmptyRows: true,
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.emptyRowDefaultValues);
      t.end();
    });
  });

  test('should parse data:[null] to csv with only column title, despite options.includeEmptyRows', function (t) {
    json2csv({
      data: [null],
      fields: ['carModel', 'price', 'color'],
      includeEmptyRows: true,
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, '"carModel","price","color"');
      t.end();
    });
  });

  test('should unwind an array into multiple rows', function (t) {
    json2csv({
      data: jsonUnwind,
      fields: ['carModel', 'price', 'colors'],
      unwindPath: 'colors'
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.unwind);
      t.end()
    })
  });

  test('should unwind twice an array into multiple rows', function (t) {
    json2csv({
      data: jsonUnwind2,
      fields: ['carModel', 'price', 'items.name', 'items.color', 'items.items.position', 'items.items.color'],
      unwindPath: ['items', 'items.items']
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, csvFixtures.unwind2);
      t.end()
    })
  });

  test('should not preserve new lines in values by default', function (t) {
    json2csv({
      data: jsonEOL,
      fields: ['a string'],
      eol: '\r\n',
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, [
        '"a string"',
        '"with a \u2028description\\n and\\na new line"',
        '"with a \u2029\u2028description and\\r\\nanother new line"'
      ].join('\r\n'));
      t.end();
    });
  });

  test('should preserve new lines in values when options.preserveNewLinesInValues is true', function (t) {
    json2csv({
      data: jsonEOL,
      fields: ['a string'],
      eol: '\r\n',
      preserveNewLinesInValues: true,
    }, function (error, csv) {
      t.error(error);
      t.equal(csv, [
        '"a string"',
        '"with a \ndescription\\n and\na new line"',
        '"with a \r\ndescription and\r\nanother new line"'
      ].join('\r\n'));
      t.end();
    });
  });

  test('should add BOM character', function (t) {
    var csv = json2csv({
      data: jsonSpecialCharacters,
      withBOM: true
    });
    // Compare csv length to check if the BOM character is present
    t.equal(csv.length, csvFixtures.default.length + 1);
    t.equal(csv.length, csvFixtures.withBOM.length);
    t.end();
  });
})
  .catch(console.log); // eslint-disable-line no-console
