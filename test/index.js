'use strict';

const Readable = require('stream').Readable
const test = require('tape');
const json2csv = require('../lib/json2csv');
const Json2csvParser = json2csv.Parser;
const Json2csvTransform = json2csv.Transform;
const parseLdJson = require('../lib/parse-ldjson');
const loadFixtures = require('./helpers/load-fixtures');

Promise.all([
  loadFixtures.loadJSON(),
  loadFixtures.loadJSONStreams(),
  loadFixtures.loadCSV()])
.then((fixtures) => {
  const jsonFixtures = fixtures[0];
  const jsonFixturesStreams = fixtures[1];
  const csvFixtures = fixtures[2];

  test('should parse json to csv and infer the fields automatically using parse method', (t) => {
    const csv = json2csv.parse(jsonFixtures.default);

    t.ok(typeof csv === 'string');
    t.equal(csv, csvFixtures.default);
    t.end();
  });

  test('should error if input data is not an object', (t) => {
    const input = 'not an object';
    try {
      const parser = new Json2csvParser();
      parser.parse(input);

      t.notOk(true);
    } catch(error) {
      t.equal(error.message, 'params should include "fields" and/or non-empty "data" array of objects');
      t.end();
    }
  });

  test('should handle empty object', (t) => {
    const input = {};
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(input);

    t.equal(csv, '"carModel","price","color"');
    t.end();
  });

  test('should hanlde array with nulls', (t) => {
    const input = [null];
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(input);

    t.equal(csv, '"carModel","price","color"');
    t.end();
  });

  test('should handle date in input', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.date);

    t.equal(csv, csvFixtures.date);
    t.end();
  });

  test('should handle functions in input', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.functionField);

    t.equal(csv, csvFixtures.functionField);
    t.end();
  });

  test('should handle deep JSON objects', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.deepJSON);

    t.equal(csv, csvFixtures.deepJSON);
    t.end();
  });

  test('should parse json to csv and infer the fields automatically ', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.default);

    t.ok(typeof csv === 'string');
    t.equal(csv, csvFixtures.default);
    t.end();
  });

  test('should parse json to csv using custom fields', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.default);
    t.end();
  });

  test('should output only selected fields', (t) => {
    const opts = {
      fields: ['carModel', 'price']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.selected);
    t.end();
  });

  test('should output keep fields order', (t) => {
    const opts = {
      fields: ['price', 'carModel']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.reversed);
    t.end();
  });

  test('should output empty value for non-existing fields', (t) => {
    const opts = {
      fields: ['first not exist field', 'carModel', 'price', 'not exist field', 'color']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.withNotExistField);
    t.end();
  });

  test('should name columns as specified in \'fields\' property', (t) => {
    const opts = {
      fields: [{
        label: 'Car Model',
        value: 'carModel'
      },{
        label: 'Price USD',
        value: 'price'
      }]
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);
    
    t.equal(csv, csvFixtures.fieldNames);
    t.end();
  });

  test('should support nested properties selectors', (t) => {
    const opts = {
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
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.nested);

    t.equal(csv, csvFixtures.nested);
    t.end();
  });

  test('field.value function should stringify results by default', (t) => {
    const opts = {
      fields: [{
        label: 'Value1',
        value: row => row.value1.toLocaleString()
      }]
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.functionStringifyByDefault);
    
    t.equal(csv, csvFixtures.functionStringifyByDefault);
    t.end();
  });

  test('field.value function should not stringify if stringify is selected to false', (t) => {
    const opts = {
      fields: [{
        label: 'Value1',
        value: row => row.value1.toLocaleString(),
        stringify: false
      }]
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.functionNoStringify);

    t.equal(csv, csvFixtures.functionNoStringify);
    t.end();
  });

  test('should process different combinations in fields option', (t) => {
    const opts = {
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
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.fancyfields);

    t.equal(csv, csvFixtures.fancyfields);
    t.end();
  });

  // Preprocessing

  test('should support unwinding an object into multiple rows', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'colors'],
      unwind: 'colors'
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.unwind);

    t.equal(csv, csvFixtures.unwind);
    t.end();
  });

  test('should support multi-level unwind', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'items.name', 'items.color', 'items.items.position', 'items.items.color'],
      unwind: ['items', 'items.items']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.unwind2);

    t.equal(csv, csvFixtures.unwind2);
    t.end();
  });

  test('should support flattenning deep JSON', (t) => {
    const opts = {
      flatten: true
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.deepJSON);

    t.equal(csv, csvFixtures.flattenedDeepJSON);
    t.end();
  });

  test('should unwind and flatten an object in the right order', (t) => {
    const opts = {
      unwind: ['items'],
      flatten: true
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.unwindAndFlatten);

    t.equal(csv, csvFixtures.unwindAndFlatten);
    t.end();
  });

  // Default value

  test('should output the default value as set in \'defaultValue\'', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      defaultValue: ''
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.defaultValueEmpty);

    t.equal(csv, csvFixtures.defaultValueEmpty);
    t.end();
  });

  test('should override \'options.defaultValue\' with \'field.defaultValue\'', (t) => {
    const opts = {
      fields: [
        { value: 'carModel' },
        { value: 'price', default: 1 },
        { value: 'color' }
      ],
      defaultValue: ''
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.overriddenDefaultValue);

    t.equal(csv, csvFixtures.overriddenDefaultValue);
    t.end();
  });

  test('should use \'options.defaultValue\' when no \'field.defaultValue\'', (t) => {
    const opts = {
      fields: [
        {
          value: 'carModel'
        },
        {
          label: 'price',
          value: row => row.price,
          default: 1
        },
        {
          label: 'color',
          value: row => row.color
        }
      ],
      defaultValue: ''
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.overriddenDefaultValue);

    t.equal(csv, csvFixtures.overriddenDefaultValue);
    t.end();
  });

  // Quote

  test('should use a custom quote when \'quote\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      quote: '\''
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.withSimpleQuotes);
    t.end();
  });

  test('should be able to don\'t output quotes when setting \'quote\' to empty string', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      quote: ''
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.withoutQuotes);
    t.end();
  });

  // Double Quote

  test('should escape quotes with double quotes', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.quotes);

    t.equal(csv, csvFixtures.quotes);
    t.end();
  });

  test('should not escape quotes with double quotes, when there is a backslah in the end', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.backslashAtEnd);

    t.equal(csv, csvFixtures.backslashAtEnd);
    t.end();
  });

  test('should not escape quotes with double quotes, when there is a backslah in the end, and its not the last column', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.backslashAtEndInMiddleColumn);

    t.equal(csv, csvFixtures.backslashAtEndInMiddleColumn);
    t.end();
  });

  test('should escape quotes with value in \'doubleQuote\'', (t) => {
    const opts = {
      fields: ['a string'],
      doubleQuote: '*'
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.doubleQuotes);

    t.equal(csv, csvFixtures.doubleQuotes);
    t.end();
  });

  // Delimiter

  test('should use a custom delimiter when \'delimiter\' property is defined', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      delimiter: '\t'
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.tsv);
    t.end();
  });

  test('should remove last delimiter |@|', (t) => {
    const opts = { delimiter: '|@|' };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.delimiter);

    t.equal(csv, csvFixtures.delimiter);
    t.end();
  });

  // EOL

  test('should use a custom eol character when \'eol\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      eol: '\r\n'
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.eol);
    t.end();
  });

  // Excell

  test('should format strings to force excel to view the values as strings', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      excelStrings:true
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.excelStrings);
    t.end();
  });

  // Escaping and preserving values

  test('should parse JSON values with trailing backslashes', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.trailingBackslash);

    t.equal(csv, csvFixtures.trailingBackslash);
    t.end();
  });

  test('should escape " when preceeded by \\', (t) => {
    const input = [{field: '\\"'}];
    // TODO
    const parser = new Json2csvParser();
    const csv = parser.parse(input);

    t.equal(csv, '"field"\n"\\"""');
    t.end();
  });

  test('should preserve new lines in values', (t) => {
    const opts = {
      eol: '\r\n'
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.escapeEOL);

    t.equal(csv, [
      '"a string"',
      '"with a \ndescription\\n and\na new line"',
      '"with a \r\ndescription and\r\nanother new line"'
    ].join('\r\n'));
    t.end();
  });

  // Header

  test('should parse json to csv without column title', (t) => {
    const opts = {
      header: false,
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.withoutHeader);
    t.end();
  });

  // Include empty rows

  test('should not include empty rows when options.includeEmptyRows is not specified', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.emptyRow);

    t.equal(csv, csvFixtures.emptyRowNotIncluded);
    t.end();
  });

  test('should include empty rows when options.includeEmptyRows is true', (t) => {
    const opts = {
      includeEmptyRows: true
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.emptyRow);

    t.equal(csv, csvFixtures.emptyRow);
    t.end();
  });

  test('should not include empty rows when options.includeEmptyRows is false', (t) => {
    const opts = {
      includeEmptyRows: false,
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.emptyRow);

    t.equal(csv, csvFixtures.emptyRowNotIncluded);
    t.end();
  });

  test('should include empty rows when options.includeEmptyRows is true, with default values', (t) => {
    const opts = {
      fields: [
        {
          value: 'carModel'
        },
        {
          value: 'price',
          default: 1
        },
        {
          value: 'color'
        }
      ],
      defaultValue: 'NULL',
      includeEmptyRows: true,
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.emptyRow);

    t.equal(csv, csvFixtures.emptyRowDefaultValues);
    t.end();
  });

  test('should parse data:[null] to csv with only column title, despite options.includeEmptyRows', (t) => {
    const input = [null];
    const opts = {
      fields: ['carModel', 'price', 'color'],
      includeEmptyRows: true,
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(input);

    t.equal(csv, '"carModel","price","color"');
    t.end();
  });

  // BOM

  test('should add BOM character', (t) => {
    const opts = {
      withBOM: true,
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.specialCharacters);

    // Compare csv length to check if the BOM character is present
    t.equal(csv[0], '\ufeff');
    t.equal(csv.length, csvFixtures.default.length + 1);
    t.equal(csv.length, csvFixtures.withBOM.length);
    t.end();
  });

  // =======================================================
  // Tests for Streaming API
  // =======================================================

  test('should handle ld-json', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission'],
      ldjson: true
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.ldjson().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.ldjson);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should error on invalid ld-json input data', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission'],
      ldjson: true
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.ldjsonInvalid().pipe(transform);
    
    processor.on('finish', () => {
      t.notOk(true);
      t.end();
    });
    processor.on('error', (error) => {
      t.ok(error.message.indexOf('Invalid JSON') !== -1);
      t.end();
    });
  });

  test('should error if input data is not an object', (t) => {
    const input = new Readable();
    input._read = () => {};
    input.push('"not an object"');
    input.push(null);

    const transform = new Json2csvTransform();
    const processor = input.pipe(transform);
    
    processor.on('finish', () => {
      t.notOk(true);
      t.end();
    });
    processor.on('error', (error) => {
      t.equal(error.message, 'params should include "fields" and/or non-empty "data" array of objects');
      t.end();
    });
  });

  test('should error on invalid json input data', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.defaultInvalid().pipe(transform);
    
    processor.on('finish', () => {
      t.notOk(true);
      t.end();
    });
    processor.on('error', (error) => {
      t.ok(error.message.indexOf('Invalid JSON') !== -1);
      t.end();
    });
  });

  test('should handle empty object', (t) => {
    const input = new Readable();
    input._read = () => {};
    input.push('{}');
    input.push(null);

    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const transform = new Json2csvTransform(opts);
    const processor = input.pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, '"carModel","price","color"');
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should hanlde array with nulls', (t) => {
    const input = new Readable();
    input._read = () => {};
    input.push('[null]');
    input.push(null);
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const transform = new Json2csvTransform(opts);
    const processor = input.pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, '"carModel","price","color"');
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should handle deep JSON objects', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixturesStreams.deepJSON().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.deepJSON);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  // TODO infer only from first element
  // test('should parse json to csv and infer the fields automatically ', (t) => {
  //   const transform = new Json2csvTransform();
  //   const processor = jsonFixturesStreams.default().pipe(transform);

  //   let csv = '';
  //   processor
  //     .on('data', chunk => (csv += chunk.toString()))
  //     .on('end', () => {
  //       t.ok(typeof csv === 'string');
  //       t.equal(csv, csvFixtures.default);
  //       t.end();
  //     })
  //     .on('error', err => t.notOk(err));
  // });

  test('should parse json to csv using custom fields', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.default);
        t.end();
  
      })
      .on('error', err => t.notOk(err));
  });

  test('should output only selected fields', (t) => {
    const opts = {
      fields: ['carModel', 'price']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.selected);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should output keep fields order', (t) => {
    const opts = {
      fields: ['price', 'carModel']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.reversed);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should output empty value for non-existing fields', (t) => {
    const opts = {
      fields: ['first not exist field', 'carModel', 'price', 'not exist field', 'color']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.withNotExistField);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should name columns as specified in \'fields\' property', (t) => {
    const opts = {
      fields: [{
        label: 'Car Model',
        value: 'carModel'
      },{
        label: 'Price USD',
        value: 'price'
      }]
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.default().pipe(transform);
    
    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.fieldNames);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should support nested properties selectors', (t) => {
    const opts = {
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
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.nested().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.nested);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('field.value function should stringify results by default', (t) => {
    const opts = {
      fields: [{
        label: 'Value1',
        value: row => row.value1.toLocaleString()
      }]
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.functionStringifyByDefault().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.functionStringifyByDefault);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('field.value function should not stringify if stringify is selected to false', (t) => {
    const opts = {
      fields: [{
        label: 'Value1',
        value: row => row.value1.toLocaleString(),
        stringify: false
      }]
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.functionNoStringify().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.functionNoStringify);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should process different combinations in fields option', (t) => {
    const opts = {
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
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.fancyfields().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.fancyfields);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  // Preprocessing

  test('should support unwinding an object into multiple rows', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'colors'],
      unwind: 'colors'
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.unwind().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.unwind);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should support multi-level unwind', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'items.name', 'items.color', 'items.items.position', 'items.items.color'],
      unwind: ['items', 'items.items']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.unwind2().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.unwind2);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should support flattenning deep JSON', (t) => {
    const opts = {
      flatten: true
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.deepJSON().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.flattenedDeepJSON);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should unwind and flatten an object in the right order', (t) => {
    const opts = {
      unwind: ['items'],
      flatten: true
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.unwindAndFlatten().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.unwindAndFlatten);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  // Default value

  test('should output the default value as set in \'defaultValue\'', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      defaultValue: ''
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.defaultValueEmpty().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.defaultValueEmpty);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should override \'options.defaultValue\' with \'field.defaultValue\'', (t) => {
    const opts = {
      fields: [
        { value: 'carModel' },
        { value: 'price', default: 1 },
        { value: 'color' }
      ],
      defaultValue: ''
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.overriddenDefaultValue().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.overriddenDefaultValue);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should use \'options.defaultValue\' when no \'field.defaultValue\'', (t) => {
    const opts = {
      fields: [
        {
          value: 'carModel'
        },
        {
          label: 'price',
          value: row => row.price,
          default: 1
        },
        {
          label: 'color',
          value: row => row.color
        }
      ],
      defaultValue: ''
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.overriddenDefaultValue().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.overriddenDefaultValue);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  // Quote

  test('should use a custom quote when \'quote\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      quote: '\''
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.withSimpleQuotes);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should be able to don\'t output quotes when setting \'quote\' to empty string', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      quote: ''
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.withoutQuotes);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  // Double Quote

  test('should escape quotes with double quotes', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixturesStreams.quotes().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.quotes);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should not escape quotes with double quotes, when there is a backslah in the end', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixturesStreams.backslashAtEnd().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.backslashAtEnd);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should not escape quotes with double quotes, when there is a backslah in the end, and its not the last column', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixturesStreams.backslashAtEndInMiddleColumn().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.backslashAtEndInMiddleColumn);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should escape quotes with value in \'doubleQuote\'', (t) => {
    const opts = {
      fields: ['a string'],
      doubleQuote: '*'
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.doubleQuotes().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.doubleQuotes);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  // Delimiter

  test('should use a custom delimiter when \'delimiter\' property is defined', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      delimiter: '\t'
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.tsv);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should remove last delimiter |@|', (t) => {
    const opts = { delimiter: '|@|' };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.delimiter().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.delimiter);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  // EOL

  test('should use a custom eol character when \'eol\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      eol: '\r\n'
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.eol);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  // Excell

  test('should format strings to force excel to view the values as strings', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      excelStrings:true
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.excelStrings);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  // Escaping and preserving values

  test('should parse JSON values with trailing backslashes', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.trailingBackslash().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.trailingBackslash);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should escape " when preceeded by \\', (t) => {
    const input = new Readable();
    input._read = () => {};
    input.push(JSON.stringify([{field: '\\"'}]));
    input.push(null);
    // TODO
    const transform = new Json2csvTransform();
    const processor = input.pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, '"field"\n"\\"""');
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should preserve new lines in values', (t) => {
    const opts = {
      eol: '\r\n'
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.escapeEOL().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, [
      '"a string"',
      '"with a \ndescription\\n and\na new line"',
      '"with a \r\ndescription and\r\nanother new line"'
    ].join('\r\n'));
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  // Header

  test('should parse json to csv without column title', (t) => {
    const opts = {
      header: false,
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.withoutHeader);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  // Include empty rows

  test('should not include empty rows when options.includeEmptyRows is not specified', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixturesStreams.emptyRow().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.emptyRowNotIncluded);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should include empty rows when options.includeEmptyRows is true', (t) => {
    const opts = {
      includeEmptyRows: true
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.emptyRow().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.emptyRow);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should not include empty rows when options.includeEmptyRows is false', (t) => {
    const opts = {
      includeEmptyRows: false,
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.emptyRow().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.emptyRowNotIncluded);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should include empty rows when options.includeEmptyRows is true, with default values', (t) => {
    const opts = {
      fields: [
        {
          value: 'carModel'
        },
        {
          value: 'price',
          default: 1
        },
        {
          value: 'color'
        }
      ],
      defaultValue: 'NULL',
      includeEmptyRows: true,
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.emptyRow().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.emptyRowDefaultValues);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  test('should parse data:[null] to csv with only column title, despite options.includeEmptyRows', (t) => {
    const input = new Readable();
    input._read = () => {};
    input.push(JSON.stringify([null]));
    input.push(null);

    const opts = {
      fields: ['carModel', 'price', 'color'],
      includeEmptyRows: true,
    };

    const transform = new Json2csvTransform(opts);
    const processor = input.pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, '"carModel","price","color"');
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  // BOM

  test('should add BOM character', (t) => {
    const opts = {
      withBOM: true,
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixturesStreams.specialCharacters().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
    // Compare csv length to check if the BOM character is present
        t.equal(csv[0], '\ufeff');
        t.equal(csv.length, csvFixtures.default.length + 1);
        t.equal(csv.length, csvFixtures.withBOM.length);
        t.end();
      })
      .on('error', err => t.notOk(err));
  });

  // =======================================================
  // Test for parseLdJson
  // =======================================================

  test('should output a string', (t) => {
    const transform = new Json2csvTransform({
      fields: ['carModel', 'price', 'color', 'transmission']
    });
    const processor = jsonFixturesStreams.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.ok(typeof csv === 'string');
        t.equal(csv, csvFixtures.default);
        t.end();
      });
  });

  test('should parse line-delimited JSON', (t) => {
    const input = '{"foo":"bar"}\n{"foo":"qux"}';

    const parsed = parseLdJson(input);

    t.equal(parsed.length, 2, 'parsed input has correct length');
    t.end();
  });
}).catch(console.log); // eslint-disable-line no-console
