'use strict';

const Readable = require('stream').Readable;
const Json2csvTransform = require('../lib/json2csv').Transform;

module.exports = (testRunner, jsonFixtures, csvFixtures) => {
  testRunner.add('should handle ndjson', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission'],
      ndjson: true
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.ndjson().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.ndjson);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should error on invalid ndjson input data', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission'],
      ndjson: true
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.ndjsonInvalid().pipe(transform);
    
    processor.on('finish', () => {
      t.notOk(true);
      t.end();
    });
    processor.on('error', (err) => {
      t.ok(err.message.indexOf('Invalid JSON') !== -1);
      t.end();
    });
  });

  testRunner.add('should not modify the opts passed', (t) => {
    const opts = {};
    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.ok(typeof csv === 'string');
        t.equal(csv, csvFixtures.defaultStream);
        t.deepEqual(opts, {});
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should error if input data is not an object', (t) => {
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
    processor.on('error', (err) => {
      t.equal(err.message, 'Data should not be empty or the "fields" option should be included');
      t.end();
    });
  });

  testRunner.add('should error on invalid json input data', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.defaultInvalid().pipe(transform);
    
    processor.on('finish', () => {
      t.notOk(true);
      t.end();
    });
    processor.on('error', (err) => {
      t.ok(err.message.indexOf('Invalid JSON') !== -1);
      t.end();
    });
  });

  testRunner.add('should handle empty object', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.emptyObject().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.emptyObject);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should handle empty array', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.emptyArray().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.emptyObject);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should hanlde array with nulls', (t) => {
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
        t.equal(csv, csvFixtures.emptyObject);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should handle deep JSON objects', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixtures.deepJSON().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.deepJSON);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should parse json to csv and infer the fields automatically ', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixtures.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.ok(typeof csv === 'string');
        t.equal(csv, csvFixtures.defaultStream);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should parse json to csv using custom fields', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.default);
        t.end();
  
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should output only selected fields', (t) => {
    const opts = {
      fields: ['carModel', 'price']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.selected);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should output keep fields order', (t) => {
    const opts = {
      fields: ['price', 'carModel']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.reversed);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should output empty value for non-existing fields', (t) => {
    const opts = {
      fields: ['first not exist field', 'carModel', 'price', 'not exist field', 'color']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.withNotExistField);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
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

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.default().pipe(transform);
    
    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.fieldNames);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
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

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.nested().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.nested);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('field.value function should stringify results by default', (t) => {
    const opts = {
      fields: [{
        label: 'Value1',
        value: row => row.value1.toLocaleString()
      }]
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.functionStringifyByDefault().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.functionStringifyByDefault);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('field.value function should not stringify if stringify is selected to false', (t) => {
    const opts = {
      fields: [{
        label: 'Value1',
        value: row => row.value1.toLocaleString(),
        stringify: false
      }]
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.functionNoStringify().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.functionNoStringify);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
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

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.fancyfields().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.fancyfields);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  // Preprocessing

  testRunner.add('should support unwinding an object into multiple rows', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'colors'],
      unwind: 'colors'
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.unwind().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.unwind);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should support multi-level unwind', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'items.name', 'items.color', 'items.items.position', 'items.items.color'],
      unwind: ['items', 'items.items']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.unwind2().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.unwind2);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });



  testRunner.add('should unwind and blank out repeated data', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'items.name', 'items.color', 'items.items.position', 'items.items.color'],
      unwind: ['items', 'items.items'],
      unwindBlank: true
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.unwind2().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.unwind2Blank);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should support flattening deep JSON', (t) => {
    const opts = {
      flatten: true
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.deepJSON().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.flattenedDeepJSON);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should support custom flatten separator', (t) => {
    const opts = {
      flatten: true,
      flattenSeparator: '__',
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.deepJSON().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.flattenedCustomSeparatorDeepJSON);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should unwind and flatten an object in the right order', (t) => {
    const opts = {
      unwind: ['items'],
      flatten: true
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.unwindAndFlatten().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.unwindAndFlatten);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  // Default value

  testRunner.add('should output the default value as set in \'defaultValue\'', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      defaultValue: ''
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.defaultValueEmpty().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.defaultValueEmpty);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
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

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.overriddenDefaultValue().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.overriddenDefaultValue);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
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

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.overriddenDefaultValue().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.overriddenDefaultValue);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  // Quote

  testRunner.add('should use a custom quote when \'quote\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      quote: '\''
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.withSimpleQuotes);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should be able to don\'t output quotes when setting \'quote\' to empty string', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      quote: ''
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.withoutQuotes);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should escape quotes when setting \'quote\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'color'],
      quote: '\''
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.escapeCustomQuotes().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.escapeCustomQuotes);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  // Double Quote

  testRunner.add('should escape quotes with double quotes', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixtures.quotes().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.quotes);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslah in the end', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixtures.backslashAtEnd().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.backslashAtEnd);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslah in the end, and its not the last column', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixtures.backslashAtEndInMiddleColumn().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.backslashAtEndInMiddleColumn);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should escape quotes with value in \'doubleQuote\'', (t) => {
    const opts = {
      fields: ['a string'],
      doubleQuote: '*'
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.doubleQuotes().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.doubleQuotes);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should escape quotes before new line with value in \'doubleQuote\'', (t) => {
    const opts = {
      fields: ['a string']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.backslashBeforeNewLine().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.backslashBeforeNewLine);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  // Delimiter

  testRunner.add('should use a custom delimiter when \'delimiter\' property is defined', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      delimiter: '\t'
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.tsv);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should remove last delimiter |@|', (t) => {
    const opts = { delimiter: '|@|' };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.delimiter().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.delimiter);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  // EOL

  testRunner.add('should use a custom eol character when \'eol\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      eol: '\r\n'
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.eol);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  // Excell

  testRunner.add('should format strings to force excel to view the values as strings', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      excelStrings:true
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.excelStrings);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  // Escaping and preserving values

  testRunner.add('should parse JSON values with trailing backslashes', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.trailingBackslash().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.trailingBackslash);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should escape " when preceeded by \\', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixtures.escapeDoubleBackslashedDoubleQuote().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.escapeDoubleBackslashedDoubleQuote);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should preserve new lines in values', (t) => {
    const opts = {
      eol: '\r\n'
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.escapeEOL().pipe(transform);

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
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should preserve tabs in values', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixtures.escapeTab().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.escapeTab);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  // Header

  testRunner.add('should parse json to csv without column title', (t) => {
    const opts = {
      header: false,
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.withoutHeader);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  // Include empty rows

  testRunner.add('should not include empty rows when options.includeEmptyRows is not specified', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixtures.emptyRow().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.emptyRowNotIncluded);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true', (t) => {
    const opts = {
      includeEmptyRows: true
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.emptyRow().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.emptyRow);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should not include empty rows when options.includeEmptyRows is false', (t) => {
    const opts = {
      includeEmptyRows: false,
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.emptyRow().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.emptyRowNotIncluded);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
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

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.emptyRow().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.emptyRowDefaultValues);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  testRunner.add('should parse data:[null] to csv with only column title, despite options.includeEmptyRows', (t) => {
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
        t.equal(csv, csvFixtures.emptyObject);
        t.end();
      })
      .on('error', err => t.notOk(true, err.message));
  });

  // BOM

  testRunner.add('should add BOM character', (t) => {
    const opts = {
      withBOM: true,
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.specialCharacters().pipe(transform);

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
      .on('error', err => t.notOk(true, err.message));
  });
};
