'use strict';

const { Readable } = require('stream');
const {
  Transform: Json2csvTransform,
  transforms: { flatten, unwind },
  formatters: { number: numberFormatter, string: stringFormatter, stringExcel: stringExcelFormatter, stringQuoteOnlyIfNecessary: stringQuoteOnlyIfNecessaryFormatter },
} = require('../lib/json2csv');

module.exports = (testRunner, jsonFixtures, csvFixtures, inMemoryJsonFixtures) => {
  testRunner.add('should handle object mode', (t) => {
    const input = new Readable({ objectMode: true });
    input._read = () => {};
    inMemoryJsonFixtures.default.forEach(item => input.push(item));
    input.push(null);

    const opts = {
      fields: ['carModel', 'price', 'color', 'manual']
    };
    const transformOpts = { objectMode: true };

    const transform = new Json2csvTransform(opts, transformOpts);
    const processor = input.pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.ndjson);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should handle ndjson', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual'],
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should error on invalid ndjson input data', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual'],
      ndjson: true
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.ndjsonInvalid().pipe(transform);
    
    processor.on('finish', () => {
      t.fail('Exception expected');
      t.end();
    });
    processor.on('error', (err) => {
      t.ok(err.message.includes('Invalid JSON'));
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should error if input data is not an object', (t) => {
    const input = new Readable();
    input._read = () => {};
    input.push('"not an object"');
    input.push(null);

    const transform = new Json2csvTransform();
    const processor = input.pipe(transform);
    
    processor.on('finish', () => {
      t.fail('Exception expected');
      t.end();
    });
    processor.on('error', (err) => {
      t.equal(err.message, 'Data should not be empty or the "fields" option should be included');
      t.end();
    });
  });

  testRunner.add('should error on invalid json input data', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual']
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.defaultInvalid().pipe(transform);
    
    processor.on('finish', () => {
      t.fail('Exception expected');
      t.end();
    });
    processor.on('error', (err) => {
      t.ok(err.message.includes('Invalid JSON'));
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should parse json to csv using custom fields', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual']
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should output fields in the order provided', (t) => {
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });



  testRunner.add('should error on invalid \'fields\' property', (t) => {
    const opts = {
      fields: [ { value: 'price' }, () => {} ]
    };

    try {
      const transform = new Json2csvTransform(opts);
      jsonFixtures.default().pipe(transform);

      t.fail('Exception expected');
    } catch(error) {
      t.equal(error.message, `Invalid field info option. ${JSON.stringify(opts.fields[1])}`);
    }
    t.end();
  });

  testRunner.add('should error on invalid \'fields.value\' property', (t) => {
    const opts = {
      fields: [
        { value: row => row.price }, 
        { label: 'Price USD', value: [] }
      ]
    };

    try {
      const transform = new Json2csvTransform(opts);
      jsonFixtures.default().pipe(transform);

      t.fail('Exception expected');
    } catch(error) {
      t.equal(error.message, `Invalid field info option. ${JSON.stringify(opts.fields[1])}`);
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

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.nested().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.nested);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.functionStringifyByDefault().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.functionStringifyByDefault);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  // Header

  testRunner.add('should parse json to csv without column title', (t) => {
    const opts = {
      header: false,
      fields: ['carModel', 'price', 'color', 'manual']
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  // BOM

  testRunner.add('should add BOM character', (t) => {
    const opts = {
      withBOM: true,
      fields: ['carModel', 'price', 'color', 'manual']
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  // Transform

  testRunner.add('should unwind all unwindable fields using the unwind transform', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'extras.items.name', 'extras.items.color', 'extras.items.items.position', 'extras.items.items.color'],
      transforms: [unwind()],
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should support unwinding specific fields using the unwind transform', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'colors'],
      transforms: [unwind({ paths: ['colors'] })],
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should support multi-level unwind using the unwind transform', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'extras.items.name', 'extras.items.color', 'extras.items.items.position', 'extras.items.items.color'],
      transforms: [unwind({ paths: ['extras.items', 'extras.items.items'] })],
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should support unwind and blank out repeated data using the unwind transform', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'extras.items.name', 'extras.items.color', 'extras.items.items.position', 'extras.items.items.color'],
      transforms: [unwind({ paths: ['extras.items', 'extras.items.items'], blankOut: true })],
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should support flattening deep JSON using the flatten transform', (t) => {
    const opts = {
      transforms: [flatten()],
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should support flattening JSON with nested arrays using the flatten transform', (t) => {
    const opts = {
      transforms: [flatten({ arrays: true })],
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.flattenArrays().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.flattenedArrays);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should support custom flatten separator using the flatten transform', (t) => {
    const opts = {
      transforms: [flatten({ separator: '__' })],
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should support multiple transforms and honor the order in which they are declared', (t) => {
    const opts = {
      transforms: [unwind({ paths: ['items'] }), flatten()],
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should unwind complex objects using the unwind transform', (t) => {
    const opts = {
      fields: ["carModel", "price", "extras.items.name", "extras.items.items.position", "extras.items.items.color", "extras.items.items", "name", "color", "extras.items.color"],
      transforms: [unwind({ paths: ['extras.items', 'extras.items.items'] }), flatten()],
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.unwindComplexObject().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.unwindComplexObject);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should support custom transforms', (t) => {
    const opts = {
      transforms: [row => ({
        model: row.carModel,
        price: row.price / 1000,
        color: row.color,
        manual: row.manual || 'automatic',
      })],
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.defaultCustomTransform);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  // Formatters

  // Number

  testRunner.add('should used a custom separator when \'decimals\' is passed to the number formatter', (t) => {
    const opts = {
      formatters: {
        number: numberFormatter({ decimals: 2 })
      }
    };
    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.numberFormatter().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.numberFixedDecimals);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should used a custom separator when \'separator\' is passed to the number formatter', (t) => {
    const opts = {
      delimiter: ';',
      formatters: {
        number: numberFormatter({ separator: ',' })
      }
    };
    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.numberFormatter().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.numberCustomSeparator);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should used a custom separator and fixed number of decimals when \'separator\' and \'decimals\' are passed to the number formatter', (t) => {
    const opts = {
      delimiter: ';',
      formatters: {
        number: numberFormatter({ separator: ',', decimals: 2 })
      }
    };
    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.numberFormatter().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.numberFixedDecimalsAndCustomSeparator);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  // Symbol

  testRunner.add('should format Symbol by its name', (t) => {
    const data = [{ test: Symbol('test1') }, { test: Symbol('test2') }];  
    const input = new Readable({ objectMode: true });
    input._read = () => {};
    data.forEach(item => input.push(item));
    input.push(null);

    const transformOpts = { readableObjectMode: true, writableObjectMode: true };

    const transform = new Json2csvTransform({}, transformOpts);
    const processor = input.pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, '"test"\n"test1"\n"test2"');
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  // String Quote

  testRunner.add('should use a custom quote when \'quote\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      formatters: {
        string: stringFormatter({ quote: '\'' })
      }
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should be able to don\'t output quotes when setting \'quote\' to empty string', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      formatters: {
        string: stringFormatter({ quote: '' })
      }
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should escape quotes when setting \'quote\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'color'],
      formatters: {
        string: stringFormatter({ quote: '\'' })
      }
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should not escape \'"\' when setting \'quote\' set to something else', (t) => {
    const opts = {
      formatters: {
        string: stringFormatter({ quote: '\'' })
      }
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.escapedQuotes().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.escapedQuotesUnescaped);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  // String Escaped Quote

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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslash in the end', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixtures.backslashAtEnd().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.backslashAtEnd);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslash in the end, and its not the last column', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixtures.backslashAtEndInMiddleColumn().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.backslashAtEndInMiddleColumn);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should escape quotes with value in \'escapedQuote\'', (t) => {
    const opts = {
      fields: ['a string'],
      formatters: {
        string: stringFormatter({ escapedQuote: '*' })
      }
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.escapedQuotes().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.escapedQuotes);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should escape quotes before new line with value in \'escapedQuote\'', (t) => {
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  // String Quote Only if Necessary

  testRunner.add('should quote only if necessary if using stringQuoteOnlyIfNecessary formatter', (t) => {
    const opts = {
      formatters: {
        string: stringQuoteOnlyIfNecessaryFormatter()
      }
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.quoteOnlyIfNecessary().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.quoteOnlyIfNecessary);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  // String Excel

  testRunner.add('should format strings to force excel to view the values as strings', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      formatters: {
        string: stringExcelFormatter
      }
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should format strings to force excel to view the values as strings with escaped quotes', (t) => {
    const opts = {
      formatters: {
        string: stringExcelFormatter
      }
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.quotes().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.excelStringsWithEscapedQuoted);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });


  // String Escaping and preserving values

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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  testRunner.add('should escape " when preceeded by \\', (t) => {
    const transform = new Json2csvTransform();
    const processor = jsonFixtures.escapeDoubleBackslashedEscapedQuote().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.escapeDoubleBackslashedEscapedQuote);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      '"with a \u2028description\\n and\na new line"',
      '"with a \u2029\u2028description and\r\nanother new line"'
    ].join('\r\n'));
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
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
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });

  // Headers

  testRunner.add('should format headers based on the headers formatter', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual'],
      formatters: {
        header: stringFormatter({ quote: '' })
      }
    };

    const transform = new Json2csvTransform(opts);
    const processor = jsonFixtures.default().pipe(transform);

    let csv = '';
    processor
      .on('data', chunk => (csv += chunk.toString()))
      .on('end', () => {
        t.equal(csv, csvFixtures.customHeaderQuotes);
        t.end();
      })
      .on('error', err => {
        t.fail(err.message);
        t.end();  
      });
  });
};
