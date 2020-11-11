'use strict';

const {
  parse,
  Parser: Json2csvParser,
  transforms: { flatten, unwind },
  formatters: { number: numberFormatter, string: stringFormatter, stringExcel: stringExcelFormatter, stringQuoteOnlyIfNecessary: stringQuoteOnlyIfNecessaryFormatter },
} = require('../lib/json2csv');

module.exports = (testRunner, jsonFixtures, csvFixtures) => {
  testRunner.add('should parse json to csv, infer the fields automatically and not modify the opts passed using parse method', (t) => {
    const opts = {};

    const csv = parse(jsonFixtures.default);

    t.ok(typeof csv === 'string');
    t.equal(csv, csvFixtures.default);
    t.deepEqual(opts, {});
    t.end();
  });

  testRunner.add('should not modify the opts passed', (t) => {
    const opts = {};
    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.ok(typeof csv === 'string');
    t.equal(csv, csvFixtures.default);
    t.deepEqual(opts, {});
    t.end();
  });

  testRunner.add('should error if input data is not an object', (t) => {
    const input = 'not an object';
    try {
      const parser = new Json2csvParser();
      parser.parse(input);

      t.fail('Exception expected');
    } catch(error) {
      t.equal(error.message, 'Data should not be empty or the "fields" option should be included');
    }
    t.end();
  });

  testRunner.add('should handle empty object', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.emptyObject);

    t.equal(csv, csvFixtures.emptyObject);
    t.end();
  });

  testRunner.add('should handle empty array', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.emptyArray);

    t.equal(csv, csvFixtures.emptyObject);
    t.end();
  });

  testRunner.add('should hanlde array with nulls', (t) => {
    const input = [null];
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(input);

    t.equal(csv, csvFixtures.emptyObject);
    t.end();
  });

  testRunner.add('should handle date in input', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.date);

    t.equal(csv, csvFixtures.date);
    t.end();
  });

  testRunner.add('should handle functions in input', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.functionField);

    t.equal(csv, csvFixtures.functionField);
    t.end();
  });

  testRunner.add('should handle deep JSON objects', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.deepJSON);

    t.equal(csv, csvFixtures.deepJSON);
    t.end();
  });

  testRunner.add('should parse json to csv and infer the fields automatically ', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.default);

    t.ok(typeof csv === 'string');
    t.equal(csv, csvFixtures.default);
    t.end();
  });

  testRunner.add('should parse json to csv using custom fields', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.default);
    t.end();
  });

  testRunner.add('should output only selected fields', (t) => {
    const opts = {
      fields: ['carModel', 'price']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.selected);
    t.end();
  });

  testRunner.add('should output fields in the order provided', (t) => {
    const opts = {
      fields: ['price', 'carModel']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.reversed);
    t.end();
  });

  testRunner.add('should output empty value for non-existing fields', (t) => {
    const opts = {
      fields: ['first not exist field', 'carModel', 'price', 'not exist field', 'color']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.withNotExistField);
    t.end();
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

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);
    
    t.equal(csv, csvFixtures.fieldNames);
    t.end();
  });

  testRunner.add('should error on invalid \'fields\' property', (t) => {
    const opts = {
      fields: [ { value: 'price' }, () => {} ]
    };

    try {
      const parser = new Json2csvParser(opts);
      parser.parse(jsonFixtures.default);

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
      const parser = new Json2csvParser(opts);
      parser.parse(jsonFixtures.default);

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

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.nested);

    t.equal(csv, csvFixtures.nested);
    t.end();
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

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.functionStringifyByDefault);
    
    t.equal(csv, csvFixtures.functionStringifyByDefault);
    t.end();
  });

  testRunner.add('field.value function should stringify results by default', (t) => {
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

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.fancyfields);

    t.equal(csv, csvFixtures.fancyfields);
    t.end();
  });

  testRunner.add('should not cache the fields option between executions', (t) => {
    const parser = new Json2csvParser();
    const csv1 = parser.parse({ test1: 1});
    t.equal(csv1, '"test1"\n1');
    const csv2 = parser.parse({ test2: 2});
    t.equal(csv2, '"test2"\n2');
    t.end();
  });

  // Default value

  testRunner.add('should output the default value as set in \'defaultValue\'', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      defaultValue: ''
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.defaultValueEmpty);

    t.equal(csv, csvFixtures.defaultValueEmpty);
    t.end();
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

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.overriddenDefaultValue);

    t.equal(csv, csvFixtures.overriddenDefaultValue);
    t.end();
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

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.overriddenDefaultValue);

    t.equal(csv, csvFixtures.overriddenDefaultValue);
    t.end();
  });

  // Delimiter

  testRunner.add('should use a custom delimiter when \'delimiter\' property is defined', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      delimiter: '\t'
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.tsv);
    t.end();
  });

  testRunner.add('should remove last delimiter |@|', (t) => {
    const opts = { delimiter: '|@|' };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.delimiter);

    t.equal(csv, csvFixtures.delimiter);
    t.end();
  });

  // EOL

  testRunner.add('should use a custom eol character when \'eol\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      eol: '\r\n'
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.eol);
    t.end();
  });

  // Header

  testRunner.add('should parse json to csv without column title', (t) => {
    const opts = {
      header: false,
      fields: ['carModel', 'price', 'color', 'manual']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.withoutHeader);
    t.end();
  });

  // Include empty rows

  testRunner.add('should not include empty rows when options.includeEmptyRows is not specified', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.emptyRow);

    t.equal(csv, csvFixtures.emptyRowNotIncluded);
    t.end();
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true', (t) => {
    const opts = {
      includeEmptyRows: true
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.emptyRow);

    t.equal(csv, csvFixtures.emptyRow);
    t.end();
  });

  testRunner.add('should not include empty rows when options.includeEmptyRows is false', (t) => {
    const opts = {
      includeEmptyRows: false,
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.emptyRow);

    t.equal(csv, csvFixtures.emptyRowNotIncluded);
    t.end();
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

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.emptyRow);

    t.equal(csv, csvFixtures.emptyRowDefaultValues);
    t.end();
  });

  testRunner.add('should parse data:[null] to csv with only column title, despite options.includeEmptyRows', (t) => {
    const input = [null];
    const opts = {
      fields: ['carModel', 'price', 'color'],
      includeEmptyRows: true,
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(input);

    t.equal(csv, csvFixtures.emptyObject);
    t.end();
  });

  // BOM

  testRunner.add('should add BOM character', (t) => {
    const opts = {
      withBOM: true,
      fields: ['carModel', 'price', 'color', 'manual']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.specialCharacters);

    // Compare csv length to check if the BOM character is present
    t.equal(csv[0], '\ufeff');
    t.equal(csv.length, csvFixtures.default.length + 1);
    t.equal(csv.length, csvFixtures.withBOM.length);
    t.end();
  });

  // Transforms

  testRunner.add('should unwind all unwindable fields using the unwind transform', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'extras.items.name', 'extras.items.color', 'extras.items.items.position', 'extras.items.items.color'],
      transforms: [unwind()],
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.unwind2);

    t.equal(csv, csvFixtures.unwind2);
    t.end();
  });

  testRunner.add('should support unwinding specific fields using the unwind transform', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'colors'],
      transforms: [unwind({ paths: ['colors'] })],
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.unwind);

    t.equal(csv, csvFixtures.unwind);
    t.end();
  });

  testRunner.add('should support multi-level unwind using the unwind transform', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'extras.items.name', 'extras.items.color', 'extras.items.items.position', 'extras.items.items.color'],
      transforms: [unwind({ paths: ['extras.items', 'extras.items.items'] })],
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.unwind2);

    t.equal(csv, csvFixtures.unwind2);
    t.end();
  });

  testRunner.add('should support unwind and blank out repeated data using the unwind transform', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'extras.items.name', 'extras.items.color', 'extras.items.items.position', 'extras.items.items.color'],
      transforms: [unwind({ paths: ['extras.items', 'extras.items.items'], blankOut: true })],
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.unwind2);

    t.equal(csv, csvFixtures.unwind2Blank);
    t.end();
  });

  testRunner.add('should support flattening deep JSON using the flatten transform', (t) => {
    const opts = {
      transforms: [flatten()],
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.deepJSON);

    t.equal(csv, csvFixtures.flattenedDeepJSON);
    t.end();
  });

  testRunner.add('should support flattening JSON with toJSON using the flatten transform', (t) => {
    const opts = {
      transforms: [flatten()],
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.flattenToJSON);

    t.equal(csv, csvFixtures.flattenToJSON);
    t.end();
  });

  testRunner.add('should support flattening JSON with nested arrays using the flatten transform', (t) => {
    const opts = {
      transforms: [flatten({ arrays: true })],
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.flattenArrays);

    t.equal(csv, csvFixtures.flattenedArrays);
    t.end();
  });

  testRunner.add('should support custom flatten separator using the flatten transform', (t) => {
    const opts = {
      transforms: [flatten({ separator: '__' })],
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.deepJSON);

    t.equal(csv, csvFixtures.flattenedCustomSeparatorDeepJSON);
    t.end();
  });

  testRunner.add('should support multiple transforms and honor the order in which they are declared', (t) => {
    const opts = {
      transforms: [unwind({ paths: ['items'] }), flatten()],
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.unwindAndFlatten);

    t.equal(csv, csvFixtures.unwindAndFlatten);
    t.end();
  });

  testRunner.add('should unwind complex objects using the unwind transform', (t) => {
    const opts = {
      transforms: [unwind({ paths: ['extras.items', 'extras.items.items'] }), flatten()],
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.unwindComplexObject);

    t.equal(csv, csvFixtures.unwindComplexObject);
    t.end();
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

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.defaultCustomTransform);
    t.end();
  });

  // Formatters

  // undefined
  // boolean

  // Number

  testRunner.add('should used a custom separator when \'decimals\' is passed to the number formatter', (t) => {
    const opts = {
      formatters: {
        number: numberFormatter({ decimals: 2 })
      }
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.numberFormatter);

    t.equal(csv, csvFixtures.numberFixedDecimals);
    t.end();
  });

  testRunner.add('should used a custom separator when \'separator\' is passed to the number formatter', (t) => {
    const opts = {
      delimiter: ';',
      formatters: {
        number: numberFormatter({ separator: ',' })
      }
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.numberFormatter);

    t.equal(csv, csvFixtures.numberCustomSeparator);
    t.end();
  });

  testRunner.add('should used a custom separator and fixed number of decimals when \'separator\' and \'decimals\' are passed to the number formatter', (t) => {
    const opts = {
      delimiter: ';',
      formatters: {
        number: numberFormatter({ separator: ',', decimals: 2 })
      }
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.numberFormatter);

    t.equal(csv, csvFixtures.numberFixedDecimalsAndCustomSeparator);
    t.end();
  });
 
  // Symbol

  testRunner.add('should format Symbol by its name', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse([{ test: Symbol('test1') }, { test: Symbol('test2') }]);

    t.equal(csv, '"test"\n"test1"\n"test2"');
    t.end();
  });

  // function
  // object

  // String Quote

  testRunner.add('should use a custom quote when \'quote\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      formatters: {
        string: stringFormatter({ quote: '\'' })
      }
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.withSimpleQuotes);
    t.end();
  });

  testRunner.add('should be able to don\'t output quotes when setting \'quote\' to empty string', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      formatters: {
        string: stringFormatter({ quote: '' })
      }
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.withoutQuotes);
    t.end();
  });

  testRunner.add('should escape quotes when setting \'quote\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'color'],
      formatters: {
        string: stringFormatter({ quote: '\'' })
      }
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.escapeCustomQuotes);

    t.equal(csv, csvFixtures.escapeCustomQuotes);
    t.end();
  });

  testRunner.add('should not escape \'"\' when setting \'quote\' set to something else', (t) => {
    const opts = {
      formatters: {
        string: stringFormatter({ quote: '\'' })
      }
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.escapedQuotes);

    t.equal(csv, csvFixtures.escapedQuotesUnescaped);
    t.end();
  });

  // String Escaped Quote

  testRunner.add('should escape quotes with double quotes', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.quotes);

    t.equal(csv, csvFixtures.quotes);
    t.end();
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslash in the end', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.backslashAtEnd);

    t.equal(csv, csvFixtures.backslashAtEnd);
    t.end();
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslash in the end, and its not the last column', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.backslashAtEndInMiddleColumn);

    t.equal(csv, csvFixtures.backslashAtEndInMiddleColumn);
    t.end();
  });

  testRunner.add('should escape quotes with value in \'escapedQuote\'', (t) => {
    const opts = {
      fields: ['a string'],
      formatters: {
        string: stringFormatter({ escapedQuote: '*' })
      }
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.escapedQuotes);

    t.equal(csv, csvFixtures.escapedQuotes);
    t.end();
  });

  testRunner.add('should escape quotes before new line with value in \'escapedQuote\'', (t) => {
    const opts = {
      fields: ['a string']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.backslashBeforeNewLine);

    t.equal(csv, csvFixtures.backslashBeforeNewLine);
    t.end();
  });

  // String Quote Only if Necessary

  testRunner.add('should quote only if necessary if using stringQuoteOnlyIfNecessary formatter', (t) => {
    const opts = {
      formatters: {
        string: stringQuoteOnlyIfNecessaryFormatter()
      }
    };
    
    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.quoteOnlyIfNecessary);

    t.equal(csv, csvFixtures.quoteOnlyIfNecessary);
    t.end();
  });

  // String Excel

  testRunner.add('should format strings to force excel to view the values as strings', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      formatters: {
        string: stringExcelFormatter()
      }
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.excelStrings);
    t.end();
  });

  // String Escaping and preserving values

  testRunner.add('should parse JSON values with trailing backslashes', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.trailingBackslash);

    t.equal(csv, csvFixtures.trailingBackslash);
    t.end();
  });

  testRunner.add('should escape " when preceeded by \\', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.escapeDoubleBackslashedEscapedQuote);

    t.equal(csv, csvFixtures.escapeDoubleBackslashedEscapedQuote);
    t.end();
  });

  testRunner.add('should preserve new lines in values', (t) => {
    const opts = {
      eol: '\r\n'
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.escapeEOL);

    t.equal(csv, [
      '"a string"',
      '"with a \u2028description\\n and\na new line"',
      '"with a \u2029\u2028description and\r\nanother new line"'
    ].join('\r\n'));
    t.end();
  });

  testRunner.add('should preserve tabs in values', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.escapeTab);

    t.equal(csv, csvFixtures.escapeTab);
    t.end();
  });

  // Headers

  testRunner.add('should format headers based on the headers formatter', (t) => {
    const opts = {
      formatters: {
        header: stringFormatter({ quote: '' })
      }
    };
  
    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.customHeaderQuotes);
    t.end();
  });
};
