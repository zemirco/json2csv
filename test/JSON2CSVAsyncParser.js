'use strict';

const { Readable} = require('stream');
const {
  parseAsync,
  AsyncParser,
  transforms: { flatten, unwind },
  formatters: { number: numberFormatter, string: stringFormatter, stringExcel: stringExcelFormatter, stringQuoteOnlyIfNecessary: stringQuoteOnlyIfNecessaryFormatter },
} = require('../lib/json2csv');

module.exports = (testRunner, jsonFixtures, csvFixtures, inMemoryJsonFixtures) => {
  testRunner.add('should should error async if invalid opts are passed using parseAsync method', async (t) => {
    const opts = {
      fields: [undefined]
    };

    try {
      await parseAsync(inMemoryJsonFixtures.default, opts);
      t.fail('Exception expected');
    } catch(err) {
      t.equal(err.message, 'Invalid field info option. undefined');
    }

    t.end();
  });

  testRunner.add('should parse in-memory json array to csv, infer the fields automatically and not modify the opts passed using parseAsync method', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual']
    };

    try {
      const csv = await parseAsync(inMemoryJsonFixtures.default, opts);
      t.ok(typeof csv === 'string');
      t.equal(csv, csvFixtures.default);
      t.deepEqual(opts, { fields: ['carModel', 'price', 'color', 'manual'] });
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });
  
  testRunner.add('should parse in-memory json object to csv, infer the fields automatically and not modify the opts passed using parseAsync method', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual']
    };

    try {
      const csv = await parseAsync({ "carModel": "Audi",      "price": 0,  "color": "blue" }, opts);
      t.ok(typeof csv === 'string');
      t.equal(csv, '"carModel","price","color","manual"\n"Audi",0,"blue",');
      t.deepEqual(opts, { fields: ['carModel', 'price', 'color', 'manual'] });
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should parse streaming json to csv, infer the fields automatically and not modify the opts passed using parseAsync method', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual']
    };

    try {
      const csv = await parseAsync(jsonFixtures.default(), opts);
      t.ok(typeof csv === 'string');
      t.equal(csv, csvFixtures.default);
      t.deepEqual(opts, { fields: ['carModel', 'price', 'color', 'manual'] });
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should handle object mode with default input', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual']
    };
    const transformOpts = { readableObjectMode: true, writableObjectMode: true };
    const parser = new AsyncParser(opts, transformOpts);

    try {
      const csv = await parser.parse(inMemoryJsonFixtures.default).promise();
      t.equal(csv, csvFixtures.ndjson);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should handle object mode with custom input', async (t) => {
    const input = new Readable({ objectMode: true });
    input._read = () => {};
    inMemoryJsonFixtures.default.forEach(item => input.push(item));
    input.push(null);

    const opts = {
      fields: ['carModel', 'price', 'color', 'manual']
    };
    const transformOpts = { readableObjectMode: true, writableObjectMode: true };
    const parser = new AsyncParser(opts, transformOpts);
    
    try {
      const csv = await parser.parse(input).promise();
      t.equal(csv, csvFixtures.ndjson);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should handle ndjson', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual'],
      ndjson: true
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.ndjson()).promise();
      t.equal(csv, csvFixtures.ndjson);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should error on invalid ndjson input data', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual'],
      ndjson: true
    };
    const parser = new AsyncParser(opts);

    try {
      await parser.parse(jsonFixtures.ndjsonInvalid()).promise();
      t.fail('Exception expected');
    } catch(err) {
      t.ok(err.message.includes('Invalid JSON'));
    }

    t.end();
  });

  testRunner.add('should not modify the opts passed', async (t) => {
    const opts = {};
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
      t.ok(typeof csv === 'string');
      t.equal(csv, csvFixtures.defaultStream);
      t.deepEqual(opts, {});
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should error if input data is not an object', async (t) => {
    const parser = new AsyncParser();

    try {
      parser.parse('"not an object"');
      t.fail('Exception expected');
    } catch(err) {
      t.equal(err.message, 'Data should not be empty or the "fields" option should be included');
    }
    
    t.end();
  });

  testRunner.add('should error on invalid json input data', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual']
    };
    const parser = new AsyncParser(opts);

    try {
      await parser.parse(jsonFixtures.defaultInvalid()).promise();
      t.fail('Exception expected');
    } catch(err) {
      t.ok(err.message.includes('Invalid JSON'));
    }

    t.end();
  });

  testRunner.add('should handle empty object', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.emptyObject()).promise();
      t.equal(csv, csvFixtures.emptyObject);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should handle empty array', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.emptyArray()).promise();
      t.equal(csv, csvFixtures.emptyObject);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should hanlde array with nulls', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse([null]).promise();
      t.equal(csv, csvFixtures.emptyObject);
    } catch(err) {
      t.fail(err.message);
    }


    t.end();
  });

  testRunner.add('should handle deep JSON objects', async (t) => {
    const parser = new AsyncParser();

    try {
      const csv = await parser.parse(jsonFixtures.deepJSON()).promise();
      t.equal(csv, csvFixtures.deepJSON);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should parse json to csv and infer the fields automatically ', async (t) => {
    const parser = new AsyncParser();

    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
        t.ok(typeof csv === 'string');
        t.equal(csv, csvFixtures.defaultStream);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should parse json to csv using custom fields', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual']
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
      t.equal(csv, csvFixtures.default);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should output only selected fields', async (t) => {
    const opts = {
      fields: ['carModel', 'price']
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
      t.equal(csv, csvFixtures.selected);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should output fields in the order provided', async (t) => {
    const opts = {
      fields: ['price', 'carModel']
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
      t.equal(csv, csvFixtures.reversed);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should output empty value for non-existing fields', async (t) => {
    const opts = {
      fields: ['first not exist field', 'carModel', 'price', 'not exist field', 'color']
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
      t.equal(csv, csvFixtures.withNotExistField);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should name columns as specified in \'fields\' property', async (t) => {
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

    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
      t.equal(csv, csvFixtures.fieldNames);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should error on invalid \'fields\' property', async (t) => {
    const opts = {
      fields: [ { value: 'price' }, () => {} ]
    };

    try {
      const parser = new AsyncParser(opts);
      parser.parse(jsonFixtures.default()).promise();

      t.fail('Exception expected');
    } catch(error) {
      t.equal(error.message, `Invalid field info option. ${JSON.stringify(opts.fields[1])}`);
    }

    t.end();
  });

  testRunner.add('should error on invalid \'fields.value\' property', async (t) => {
    const opts = {
      fields: [
        { value: row => row.price }, 
        { label: 'Price USD', value: [] }
      ]
    };

    try {
      const parser = new AsyncParser(opts);
      parser.parse(jsonFixtures.default()).promise();

      t.fail('Exception expected');
    } catch(error) {
      t.equal(error.message, `Invalid field info option. ${JSON.stringify(opts.fields[1])}`);
    }

    t.end();
  });

  testRunner.add('should support nested properties selectors', async (t) => {
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

    try {
      const csv = await parser.parse(jsonFixtures.nested()).promise();
      t.equal(csv, csvFixtures.nested);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('field.value function should receive a valid field object', async (t) => {
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

    try {
      const csv = await parser.parse(jsonFixtures.functionStringifyByDefault()).promise();
      t.equal(csv, csvFixtures.functionStringifyByDefault);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('field.value function should stringify results by default', async (t) => {
    const opts = {
      fields: [{
        label: 'Value1',
        value: row => row.value1.toLocaleString()
      }]
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.functionStringifyByDefault()).promise();
      t.equal(csv, csvFixtures.functionStringifyByDefault);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });


  testRunner.add('should process different combinations in fields option', async (t) => {
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

    try {
      const csv = await parser.parse(jsonFixtures.fancyfields()).promise();
      t.equal(csv, csvFixtures.fancyfields);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  // Default value

  testRunner.add('should output the default value as set in \'defaultValue\'', async (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      defaultValue: ''
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.defaultValueEmpty()).promise();
      t.equal(csv, csvFixtures.defaultValueEmpty);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should override \'options.defaultValue\' with \'field.defaultValue\'', async (t) => {
    const opts = {
      fields: [
        { value: 'carModel' },
        { value: 'price', default: 1 },
        { value: 'color' }
      ],
      defaultValue: ''
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.overriddenDefaultValue()).promise();
      t.equal(csv, csvFixtures.overriddenDefaultValue);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should use \'options.defaultValue\' when no \'field.defaultValue\'', async (t) => {
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

    try {
      const csv = await parser.parse(jsonFixtures.overriddenDefaultValue()).promise();
      t.equal(csv, csvFixtures.overriddenDefaultValue);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  // Delimiter

  testRunner.add('should use a custom delimiter when \'delimiter\' property is defined', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      delimiter: '\t'
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
      t.equal(csv, csvFixtures.tsv);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should remove last delimiter |@|', async (t) => {
    const opts = { delimiter: '|@|' };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.delimiter()).promise();
      t.equal(csv, csvFixtures.delimiter);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  // EOL

  testRunner.add('should use a custom eol character when \'eol\' property is present', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      eol: '\r\n'
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
      t.equal(csv, csvFixtures.eol);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  // Header

  testRunner.add('should parse json to csv without column title', async (t) => {
    const opts = {
      header: false,
      fields: ['carModel', 'price', 'color', 'manual']
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
      t.equal(csv, csvFixtures.withoutHeader);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  // Include empty rows

  testRunner.add('should not include empty rows when options.includeEmptyRows is not specified', async (t) => {
    const parser = new AsyncParser();
    try {
      const csv = await parser.parse(jsonFixtures.emptyRow()).promise();
      t.equal(csv, csvFixtures.emptyRowNotIncluded);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true', async (t) => {
    const opts = {
      includeEmptyRows: true
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.emptyRow()).promise();
      t.equal(csv, csvFixtures.emptyRow);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should not include empty rows when options.includeEmptyRows is false', async (t) => {
    const opts = {
      includeEmptyRows: false,
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.emptyRow()).promise();
      t.equal(csv, csvFixtures.emptyRowNotIncluded);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true, with default values', async (t) => {
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

    try {
      const csv = await parser.parse(jsonFixtures.emptyRow()).promise();
      t.equal(csv, csvFixtures.emptyRowDefaultValues);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should parse data:[null] to csv with only column title, despite options.includeEmptyRows', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      includeEmptyRows: true,
    };

    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse([null]).promise();
      t.equal(csv, csvFixtures.emptyObject);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  // BOM

  testRunner.add('should add BOM character', async (t) => {
    const opts = {
      withBOM: true,
      fields: ['carModel', 'price', 'color', 'manual']
    };
    const parser = new AsyncParser(opts);
    
    try {
      const csv = await parser.parse(jsonFixtures.specialCharacters()).promise();
      // Compare csv length to check if the BOM character is present
      t.equal(csv[0], '\ufeff');
      t.equal(csv.length, csvFixtures.default.length + 1);
      t.equal(csv.length, csvFixtures.withBOM.length);
     } catch(err) {
       t.fail(err.message);
     }

     t.end();
  });

  // Transforms

  testRunner.add('should unwind all unwindable fields using the unwind transform', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'extras.items.name', 'extras.items.color', 'extras.items.items.position', 'extras.items.items.color'],
      transforms: [unwind()],
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.unwind2()).promise();
      t.equal(csv, csvFixtures.unwind2);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should support unwinding specific fields using the unwind transform', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'colors'],
      transforms: [unwind({ paths: ['colors'] })],
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.unwind()).promise();
      t.equal(csv, csvFixtures.unwind);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should support multi-level unwind using the unwind transform', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'extras.items.name', 'extras.items.color', 'extras.items.items.position', 'extras.items.items.color'],
      transforms: [unwind({ paths: ['extras.items', 'extras.items.items'] })],
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.unwind2()).promise();
      t.equal(csv, csvFixtures.unwind2);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should support unwind and blank out repeated data using the unwind transform', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'extras.items.name', 'extras.items.color', 'extras.items.items.position', 'extras.items.items.color'],
      transforms: [unwind({ paths: ['extras.items', 'extras.items.items'], blankOut: true })],
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.unwind2()).promise();
      t.equal(csv, csvFixtures.unwind2Blank);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should support flattening deep JSON using the flatten transform', async (t) => {
    const opts = {
      transforms: [flatten()],
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.deepJSON()).promise();
      t.equal(csv, csvFixtures.flattenedDeepJSON);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should support flattening JSON with nested arrays using the flatten transform', async (t) => {
    const opts = {
      transforms: [flatten({ arrays: true })],
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.flattenArrays()).promise();
      t.equal(csv, csvFixtures.flattenedArrays);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should support custom flatten separator using the flatten transform', async (t) => {
    const opts = {
      transforms: [flatten({ separator: '__' })],
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.deepJSON()).promise();
      t.equal(csv, csvFixtures.flattenedCustomSeparatorDeepJSON);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should support multiple transforms and honor the order in which they are declared', async (t) => {
    const opts = {
      transforms: [unwind({ paths: ['items'] }), flatten()],
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.unwindAndFlatten()).promise();
      t.equal(csv, csvFixtures.unwindAndFlatten);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should support custom transforms', async (t) => {
    const opts = {
      transforms: [row => ({
        model: row.carModel,
        price: row.price / 1000,
        color: row.color,
        manual: row.manual || 'automatic',
      })],
    };

    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
      t.equal(csv, csvFixtures.defaultCustomTransform);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  // Formatters



  // Number

  testRunner.add('should used a custom separator when \'decimals\' is passed to the number formatter', async (t) => {
    const opts = {
      formatters: {
        number: numberFormatter({ decimals: 2 })
      }
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.numberFormatter()).promise();
      t.equal(csv, csvFixtures.numberFixedDecimals);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should used a custom separator when \'separator\' is passed to the number formatter', async (t) => {
    const opts = {
      delimiter: ';',
      formatters: {
        number: numberFormatter({ separator: ',' })
      }
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.numberFormatter()).promise();
      t.equal(csv, csvFixtures.numberCustomSeparator);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should used a custom separator and fixed number of decimals when \'separator\' and \'decimals\' are passed to the number formatter', async (t) => {
    const opts = {
      delimiter: ';',
      formatters: {
        number: numberFormatter({ separator: ',', decimals: 2 })
      }
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.numberFormatter()).promise();
      t.equal(csv, csvFixtures.numberFixedDecimalsAndCustomSeparator);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  // Symbol

  testRunner.add('should format Symbol by its name', async (t) => {
    const data = [{ test: Symbol('test1') }, { test: Symbol('test2') }]; 
    const input = new Readable({ objectMode: true });
    input._read = () => {};
    data.forEach(item => input.push(item));
    input.push(null);

    const transformOpts = { readableObjectMode: true, writableObjectMode: true };

    const parser = new AsyncParser({}, transformOpts);

    try {
      const csv = await parser.parse(input).promise();
      t.equal(csv, '"test"\n"test1"\n"test2"');
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  // String Quote

  testRunner.add('should use a custom quote when \'quote\' property is present', async (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      formatters: {
        string: stringFormatter({ quote: '\'' })
      }
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
      t.equal(csv, csvFixtures.withSimpleQuotes);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should be able to don\'t output quotes when setting \'quote\' to empty string', async (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      formatters: {
        string: stringFormatter({ quote: '' })
      }
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
      t.equal(csv, csvFixtures.withoutQuotes);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should escape quotes when setting \'quote\' property is present', async (t) => {
    const opts = {
      fields: ['carModel', 'color'],
      formatters: {
        string: stringFormatter({ quote: '\'' })
      }
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.escapeCustomQuotes()).promise();
      t.equal(csv, csvFixtures.escapeCustomQuotes);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should not escape \'"\' when setting \'quote\' set to something else', async (t) => {
    const opts = {
      formatters: {
        string: stringFormatter({ quote: '\'' })
      }
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.escapedQuotes()).promise();
      t.equal(csv, csvFixtures.escapedQuotesUnescaped);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  // String Escaped Quote

  testRunner.add('should escape quotes with double quotes', async (t) => {
    const parser = new AsyncParser();
    try {
      const csv = await parser.parse(jsonFixtures.quotes()).promise();
      t.equal(csv, csvFixtures.quotes);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslash in the end', async (t) => {
    const parser = new AsyncParser();
    try {
      const csv = await parser.parse(jsonFixtures.backslashAtEnd()).promise();
      t.equal(csv, csvFixtures.backslashAtEnd);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslash in the end, and its not the last column', async (t) => {
    const parser = new AsyncParser();
    try {
      const csv = await parser.parse(jsonFixtures.backslashAtEndInMiddleColumn()).promise();
      t.equal(csv, csvFixtures.backslashAtEndInMiddleColumn);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should escape quotes with value in \'escapedQuote\'', async (t) => {
    const opts = {
      fields: ['a string'],
      formatters: {
        string: stringFormatter({ escapedQuote: '*' })
      }
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.escapedQuotes()).promise();
      t.equal(csv, csvFixtures.escapedQuotes);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should escape quotes before new line with value in \'escapedQuote\'', async (t) => {
    const opts = {
      fields: ['a string']
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.backslashBeforeNewLine()).promise();
      t.equal(csv, csvFixtures.backslashBeforeNewLine);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  // String Quote Only if Necessary

  testRunner.add('should quote only if necessary if using stringQuoteOnlyIfNecessary formatter', async (t) => {
    const opts = {
      formatters: {
        string: stringQuoteOnlyIfNecessaryFormatter()
      }
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.quoteOnlyIfNecessary()).promise();
      t.equal(csv, csvFixtures.quoteOnlyIfNecessary);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  // String Excel

  testRunner.add('should format strings to force excel to view the values as strings', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      formatters: {
        string: stringExcelFormatter()
      }
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
      t.equal(csv, csvFixtures.excelStrings);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  // String Escaping and preserving values

  testRunner.add('should parse JSON values with trailing backslashes', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };
    const parser = new AsyncParser(opts);

    try {
      const csv = await parser.parse(jsonFixtures.trailingBackslash()).promise();
      t.equal(csv, csvFixtures.trailingBackslash);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should escape " when preceeded by \\', async (t) => {
    const parser = new AsyncParser();
    try {
      const csv = await parser.parse(jsonFixtures.escapeDoubleBackslashedEscapedQuote()).promise();
      t.equal(csv, csvFixtures.escapeDoubleBackslashedEscapedQuote);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should preserve new lines in values', async (t) => {
    const opts = {
      eol: '\r\n'
    };
    const parser = new AsyncParser(opts);
    
    try {
      const csv = await parser.parse(jsonFixtures.escapeEOL()).promise();
      t.equal(csv, [
        '"a string"',
        '"with a \u2028description\\n and\na new line"',
        '"with a \u2029\u2028description and\r\nanother new line"'
      ].join('\r\n'));
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  testRunner.add('should preserve tabs in values', async (t) => {
    const parser = new AsyncParser();
    try {
      const csv = await parser.parse(jsonFixtures.escapeTab()).promise();
      t.equal(csv, csvFixtures.escapeTab);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });

  // Headers

  testRunner.add('should format headers based on the headers formatter', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual'],
      formatters: {
        header: stringFormatter({ quote: '' })
      }
    };
  
    const parser = new AsyncParser(opts);
    try {
      const csv = await parser.parse(jsonFixtures.default()).promise();
      t.equal(csv, csvFixtures.customHeaderQuotes);
    } catch(err) {
      t.fail(err.message);
    }

    t.end();
  });
};
