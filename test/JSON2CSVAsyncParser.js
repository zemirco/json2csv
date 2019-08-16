'use strict';

const { Readable, Transform, Writable } = require('stream');
const { AsyncParser, parseAsync } = require('../lib/json2csv');

module.exports = (testRunner, jsonFixtures, csvFixtures, inMemoryJsonFixtures) => {
  testRunner.add('should should error async if invalid opts are passed using parseAsync method', (t) => {
    const opts = {
      fields: [undefined]
    };

    parseAsync(inMemoryJsonFixtures.default, opts)
      .then(() => t.notOk(true))
      .catch(err => t.ok(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should parse in-memory json array to csv, infer the fields automatically and not modify the opts passed using parseAsync method', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    parseAsync(inMemoryJsonFixtures.default, opts)
      .then((csv) => {
        t.ok(typeof csv === 'string');
        t.equal(csv, csvFixtures.default);
        t.deepEqual(opts, { fields: ['carModel', 'price', 'color', 'transmission'] });
      })
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });
  
  testRunner.add('should parse in-memory json object to csv, infer the fields automatically and not modify the opts passed using parseAsync method', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    parseAsync({ "carModel": "Audi",      "price": 0,  "color": "blue" }, opts)
      .then((csv) => {
        t.ok(typeof csv === 'string');
        t.equal(csv, '"carModel","price","color","transmission"\n"Audi",0,"blue",');
        t.deepEqual(opts, { fields: ['carModel', 'price', 'color', 'transmission'] });
      })
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should parse streaming json to csv, infer the fields automatically and not modify the opts passed using parseAsync method', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    parseAsync(jsonFixtures.default(), opts)
      .then((csv) => {
        t.ok(typeof csv === 'string');
        t.equal(csv, csvFixtures.default);
        t.deepEqual(opts, { fields: ['carModel', 'price', 'color', 'transmission'] });
      })
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should handle object mode with default input', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };
    const transformOpts = { readableObjectMode: true, writableObjectMode: true };

    const parser = new AsyncParser(opts, transformOpts);
    parser.promise()
      .then((csv) => t.equal(csv, csvFixtures.ndjson))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());

    inMemoryJsonFixtures.default.forEach(item => parser.input.push(item));
    parser.input.push(null);
  });

  testRunner.add('should handle object mode with custom input', (t) => {
    const input = new Readable({ objectMode: true });
    input._read = () => {};
    inMemoryJsonFixtures.default.forEach(item => input.push(item));
    input.push(null);

    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };
    const transformOpts = { readableObjectMode: true, writableObjectMode: true };

    const parser = new AsyncParser(opts, transformOpts);
    parser.fromInput(input).promise()
      .then((csv) => t.equal(csv, csvFixtures.ndjson))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should handle ndjson', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission'],
      ndjson: true
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.ndjson()).promise()
      .then((csv) => t.equal(csv, csvFixtures.ndjson))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should error on invalid ndjson input data', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission'],
      ndjson: true
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.ndjsonInvalid()).promise()
      .then(() => t.notOk(true))
      .catch(err => t.ok(err.message.includes('Invalid JSON')))
      .then(() => t.end());
  });

  testRunner.add('should not modify the opts passed', (t) => {
    const opts = {};

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.default()).promise()
      .then((csv) => {
        t.ok(typeof csv === 'string');
        t.equal(csv, csvFixtures.defaultStream);
        t.deepEqual(opts, {})
      })
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should error if input data is not an object', (t) => {
    const parser = new AsyncParser();
    parser.promise()
      .then(() => t.notOk(true))
      .catch(err => t.equal(err.message, 'Data should not be empty or the "fields" option should be included'))
      .then(() => t.end());
    
    parser.input.push('"not an object"');
    parser.input.push(null);
  });

  testRunner.add('should error on invalid json input data', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.defaultInvalid()).promise()
      .then(() => t.notOk(true))
      .catch(err => t.ok(err.message.includes('Invalid JSON')))
      .then(() => t.end());
  });

  testRunner.add('should handle empty object', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.emptyObject()).promise()
      .then(csv => t.equal(csv, csvFixtures.emptyObject))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should handle empty array', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.emptyArray()).promise()
      .then(csv => t.equal(csv, csvFixtures.emptyObject))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should hanlde array with nulls', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new AsyncParser(opts);
    parser.promise()
      .then(csv => t.equal(csv, csvFixtures.emptyObject))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
    

    parser.input.push('[null]');
    parser.input.push(null);
  });

  testRunner.add('should handle deep JSON objects', (t) => {
    const parser = new AsyncParser();
    parser.fromInput(jsonFixtures.deepJSON()).promise()
      .then(csv => t.equal(csv, csvFixtures.deepJSON))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should parse json to csv and infer the fields automatically ', (t) => {
    const parser = new AsyncParser();
    parser.fromInput(jsonFixtures.default()).promise()
      .then(csv => {
        t.ok(typeof csv === 'string');
        t.equal(csv, csvFixtures.defaultStream);
      })
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should parse json to csv using custom fields', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.default()).promise()
      .then(csv => t.equal(csv, csvFixtures.default))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should output only selected fields', (t) => {
    const opts = {
      fields: ['carModel', 'price']
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.default()).promise()
      .then(csv => t.equal(csv, csvFixtures.selected))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should output fields in the order provided', (t) => {
    const opts = {
      fields: ['price', 'carModel']
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.default()).promise()
      .then(csv => t.equal(csv, csvFixtures.reversed))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should output empty value for non-existing fields', (t) => {
    const opts = {
      fields: ['first not exist field', 'carModel', 'price', 'not exist field', 'color']
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.default()).promise()
      .then(csv => t.equal(csv, csvFixtures.withNotExistField))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should name columns as specified in \'fields\' property', (t) => {
    const opts = {
      fields: [{
        label: 'Car Model',
        value: 'carModel'
      },{
        label: 'Price USD',
        value: 'price'
      }]
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.default()).promise()
      .then(csv => t.equal(csv, csvFixtures.fieldNames))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should error on invalid \'fields\' property', (t) => {
    const opts = {
      fields: [ { value: 'price', stringify: true }, () => {} ]
    };

    try {
      const parser = new AsyncParser(opts);
      parser.fromInput(jsonFixtures.default()).promise()
        .then(csv => t.equal(csv, csvFixtures.fieldNames))
        .catch(err => t.notOk(true, err.message))
        .then(() => t.end());

      t.notOk(true);
    } catch(error) {
      t.equal(error.message, 'Invalid field info option. ' + JSON.stringify(opts.fields[1]));
    }
    t.end();
  });

  testRunner.add('should error on invalid \'fields.value\' property', (t) => {
    const opts = {
      fields: [
        { value: row => row.price, stringify: true }, 
        { label: 'Price USD', value: [] }
      ]
    };

    try {
      const parser = new AsyncParser(opts);
      parser.fromInput(jsonFixtures.default()).promise()
        .then(csv => t.equal(csv, csvFixtures.default))
        .catch(err => t.notOk(true, err.message))
        .then(() => t.end());

      t.notOk(true);
    } catch(error) {
      t.equal(error.message, 'Invalid field info option. ' + JSON.stringify(opts.fields[1]));
    }
    t.end();
  });

  testRunner.add('should support nested properties selectors', (t) => {
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

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.nested()).promise()
      .then(csv => t.equal(csv, csvFixtures.nested))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('field.value function should receive a valid field object', (t) => {
    const opts = {
      fields: [{
        label: 'Value1',
        default: 'default value',
        value: (row, field) => {
          t.deepEqual(field, { label: 'Value1', default: 'default value' });
          return row.value1.toLocaleString();
        }
      }]
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.functionStringifyByDefault()).promise()
      .then(csv => t.equal(csv, csvFixtures.functionStringifyByDefault))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('field.value function should stringify results by default', (t) => {
    const opts = {
      fields: [{
        label: 'Value1',
        value: row => row.value1.toLocaleString()
      }]
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.functionStringifyByDefault()).promise()
      .then(csv => t.equal(csv, csvFixtures.functionStringifyByDefault))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('field.value function should not stringify if stringify is selected to false', (t) => {
    const opts = {
      fields: [{
        label: 'Value1',
        value: row => row.value1.toLocaleString(),
        stringify: false
      }]
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.functionNoStringify()).promise()
      .then(csv => t.equal(csv, csvFixtures.functionNoStringify))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should process different combinations in fields option', (t) => {
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

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.fancyfields()).promise()
      .then(csv => t.equal(csv, csvFixtures.fancyfields))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  // Preprocessing

  testRunner.add('should support unwinding an object into multiple rows', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'colors'],
      unwind: 'colors'
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.unwind()).promise()
      .then(csv => t.equal(csv, csvFixtures.unwind))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should support multi-level unwind', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'extras.items.name', 'extras.items.color', 'extras.items.items.position', 'extras.items.items.color'],
      unwind: ['extras.items', 'extras.items.items']
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.unwind2()).promise()
      .then(csv => t.equal(csv, csvFixtures.unwind2))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should unwind and blank out repeated data', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'extras.items.name', 'extras.items.color', 'extras.items.items.position', 'extras.items.items.color'],
      unwind: ['extras.items', 'extras.items.items'],
      unwindBlank: true
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.unwind2()).promise()
      .then(csv => t.equal(csv, csvFixtures.unwind2Blank))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should support flattening deep JSON', (t) => {
    const opts = {
      flatten: true
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.deepJSON()).promise()
      .then(csv => t.equal(csv, csvFixtures.flattenedDeepJSON))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should support custom flatten separator', (t) => {
    const opts = {
      flatten: true,
      flattenSeparator: '__',
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.deepJSON()).promise()
      .then(csv => t.equal(csv, csvFixtures.flattenedCustomSeparatorDeepJSON))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should unwind and flatten an object in the right order', (t) => {
    const opts = {
      unwind: ['items'],
      flatten: true
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.unwindAndFlatten()).promise()
      .then(csv => t.equal(csv, csvFixtures.unwindAndFlatten))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  // Default value

  testRunner.add('should output the default value as set in \'defaultValue\'', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      defaultValue: ''
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.defaultValueEmpty()).promise()
      .then(csv => t.equal(csv, csvFixtures.defaultValueEmpty))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should override \'options.defaultValue\' with \'field.defaultValue\'', (t) => {
    const opts = {
      fields: [
        { value: 'carModel' },
        { value: 'price', default: 1 },
        { value: 'color' }
      ],
      defaultValue: ''
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.overriddenDefaultValue()).promise()
      .then(csv => t.equal(csv, csvFixtures.overriddenDefaultValue))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should use \'options.defaultValue\' when no \'field.defaultValue\'', (t) => {
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

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.overriddenDefaultValue()).promise()
      .then(csv => t.equal(csv, csvFixtures.overriddenDefaultValue))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  // Quote

  testRunner.add('should use a custom quote when \'quote\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      quote: '\''
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.default()).promise()
      .then(csv => t.equal(csv, csvFixtures.withSimpleQuotes))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should be able to don\'t output quotes when setting \'quote\' to empty string', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      quote: ''
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.default()).promise()
      .then(csv => t.equal(csv, csvFixtures.withoutQuotes))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should escape quotes when setting \'quote\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'color'],
      quote: '\''
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.escapeCustomQuotes()).promise()
      .then(csv => t.equal(csv, csvFixtures.escapeCustomQuotes))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should not escape \'"\' when setting \'quote\' set to something else', (t) => {
    const opts = {
      quote: '\''
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.doubleQuotes()).promise()
      .then(csv => t.equal(csv, csvFixtures.doubleQuotesUnescaped))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  // Double Quote

  testRunner.add('should escape quotes with double quotes', (t) => {
    const parser = new AsyncParser();
    parser.fromInput(jsonFixtures.quotes()).promise()
      .then(csv => t.equal(csv, csvFixtures.quotes))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslash in the end', (t) => {
    const parser = new AsyncParser();
    parser.fromInput(jsonFixtures.backslashAtEnd()).promise()
      .then(csv => t.equal(csv, csvFixtures.backslashAtEnd))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslash in the end, and its not the last column', (t) => {
    const parser = new AsyncParser();
    parser.fromInput(jsonFixtures.backslashAtEndInMiddleColumn()).promise()
      .then(csv => t.equal(csv, csvFixtures.backslashAtEndInMiddleColumn))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should escape quotes with value in \'doubleQuote\'', (t) => {
    const opts = {
      fields: ['a string'],
      doubleQuote: '*'
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.doubleQuotes()).promise()
      .then(csv => t.equal(csv, csvFixtures.doubleQuotes))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should escape quotes before new line with value in \'doubleQuote\'', (t) => {
    const opts = {
      fields: ['a string']
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.backslashBeforeNewLine()).promise()
      .then(csv => t.equal(csv, csvFixtures.backslashBeforeNewLine))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  // Delimiter

  testRunner.add('should use a custom delimiter when \'delimiter\' property is defined', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      delimiter: '\t'
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.default()).promise()
      .then(csv => t.equal(csv, csvFixtures.tsv))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should remove last delimiter |@|', (t) => {
    const opts = { delimiter: '|@|' };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.delimiter()).promise()
      .then(csv => t.equal(csv, csvFixtures.delimiter))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  // EOL

  testRunner.add('should use a custom eol character when \'eol\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      eol: '\r\n'
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.default()).promise()
      .then(csv => t.equal(csv, csvFixtures.eol))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  // Excell

  testRunner.add('should format strings to force excel to view the values as strings', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      excelStrings:true
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.default()).promise()
      .then(csv => t.equal(csv, csvFixtures.excelStrings))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  // Escaping and preserving values

  testRunner.add('should parse JSON values with trailing backslashes', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.trailingBackslash()).promise()
      .then(csv => t.equal(csv, csvFixtures.trailingBackslash))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should escape " when preceeded by \\', (t) => {
    const parser = new AsyncParser();
    parser.fromInput(jsonFixtures.escapeDoubleBackslashedDoubleQuote()).promise()
      .then(csv => t.equal(csv, csvFixtures.escapeDoubleBackslashedDoubleQuote))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should preserve new lines in values', (t) => {
    const opts = {
      eol: '\r\n'
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.escapeEOL()).promise()
      .then(csv => t.equal(csv, [
      '"a string"',
      '"with a \u2028description\\n and\na new line"',
      '"with a \u2029\u2028description and\r\nanother new line"'
    ].join('\r\n')))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should preserve tabs in values', (t) => {
    const parser = new AsyncParser();
    parser.fromInput(jsonFixtures.escapeTab()).promise()
      .then(csv => t.equal(csv, csvFixtures.escapeTab))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  // Header

  testRunner.add('should parse json to csv without column title', (t) => {
    const opts = {
      header: false,
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.default()).promise()
      .then(csv => t.equal(csv, csvFixtures.withoutHeader))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  // Include empty rows

  testRunner.add('should not include empty rows when options.includeEmptyRows is not specified', (t) => {
    const parser = new AsyncParser();
    parser.fromInput(jsonFixtures.emptyRow()).promise()
      .then(csv => t.equal(csv, csvFixtures.emptyRowNotIncluded))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true', (t) => {
    const opts = {
      includeEmptyRows: true
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.emptyRow()).promise()
      .then(csv => t.equal(csv, csvFixtures.emptyRow))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should not include empty rows when options.includeEmptyRows is false', (t) => {
    const opts = {
      includeEmptyRows: false,
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.emptyRow()).promise()
      .then(csv => t.equal(csv, csvFixtures.emptyRowNotIncluded))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true, with default values', (t) => {
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

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.emptyRow()).promise()
      .then(csv => t.equal(csv, csvFixtures.emptyRowDefaultValues))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should parse data:[null] to csv with only column title, despite options.includeEmptyRows', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      includeEmptyRows: true,
    };

    const parser = new AsyncParser(opts);
    parser.promise()
      .then(csv => t.equal(csv, csvFixtures.emptyObject))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());

    parser.input.push(JSON.stringify([null]));
    parser.input.push(null);
  });

  // BOM

  testRunner.add('should add BOM character', (t) => {
    const opts = {
      withBOM: true,
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.specialCharacters()).promise()
      .then(csv => {
        // Compare csv length to check if the BOM character is present
        t.equal(csv[0], '\ufeff');
        t.equal(csv.length, csvFixtures.default.length + 1);
        t.equal(csv.length, csvFixtures.withBOM.length);
      })
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  // Utility methods

  testRunner.add('should throw if two inputs are configured', (t) => {
    const parser = new AsyncParser();
    try {
      parser.fromInput(jsonFixtures.default()).fromInput(jsonFixtures.default()).promise()
        .then(csv => t.equal(csv, csvFixtures.default))
        .catch(err => t.notOk(true, err.message))
        .then(() => t.end());
    } catch(error) {
      t.equal(error.message, 'Async parser already has an input.');
    }
    t.end();
  });

  // should use custom transform


  testRunner.add('should use custom transforms if configured', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };
    const myTransform = new Transform({
      transform(chunk, encoding, callback) {
        this.push(Buffer.from(chunk.toString('utf8').replace(/c/g, 'X')));
        callback();
      }
    });
    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.default()).throughTransform(myTransform).promise()
      .then(csv => t.equal(csv, csvFixtures.default.replace(/c/g, 'X')))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });

  testRunner.add('should throw if a transform is configured after the output is configured', (t) => {
    const myTransform = new Transform({
      transform(chunk, encoding, callback) {
        this.push(Buffer.from(chunk.toString('utf8').replace(/c/g, 'X')));
        callback();
      }
    });
    const memoryOutput = new Writable({
      write(chunk, enc, cb) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, enc);
        this.inMemoryData = Buffer.concat([this.inMemoryData, buffer]);
        cb();
      },
      writev(chunks, callback) { callback(); }
    });
    const parser = new AsyncParser();
    try {
      parser.toOutput(memoryOutput).throughTransform(myTransform).promise()
        .then(csv => t.equal(csv, csvFixtures.default))
        .catch(err => t.notOk(true, err.message))
        .then(() => t.end());
    } catch(error) {
      t.equal(error.message, 'Can\'t add transforms once an output has been added.');
    }
    t.end();
  });

  testRunner.add('should use custom output if configured', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };
    const memoryOutput = new Writable({
      write(chunk, enc, cb) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, enc);
        this.inMemoryData = Buffer.concat([this.inMemoryData || Buffer.from(''), buffer]);
        cb();
      },
    });
    const parser = new AsyncParser(opts);
    parser.fromInput(jsonFixtures.default()).toOutput(memoryOutput).promise()
      .then(() => t.equal(memoryOutput.inMemoryData.toString(), csvFixtures.default))
      .catch(err => t.notOk(true, err.message))
      .then(() => t.end());
  });
  
  testRunner.add('should throw if two outputs are configured', (t) => {
    const memoryOutput = new Writable({
      write(chunk, enc, cb) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, enc);
        this.inMemoryData = Buffer.concat([this.inMemoryData, buffer]);
        cb();
      },
      writev(chunks, callback) { callback(); }
    });
    const parser = new AsyncParser();
    try {
      parser.toOutput(memoryOutput).toOutput(memoryOutput).promise()
        .then(csv => t.equal(csv, csvFixtures.default))
        .catch(err => t.notOk(true, err.message))
        .then(() => t.end());
    } catch(error) {
      t.equal(error.message, 'Async parser already has an output.');
    }
    t.end();
  });

};
