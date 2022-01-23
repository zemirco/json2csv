'use strict';

const {
  Parser,
  transforms: { flatten, unwind },
  formatters: { number: numberFormatter, string: stringFormatter, stringExcel: stringExcelFormatter, stringQuoteOnlyIfNecessary: stringQuoteOnlyIfNecessaryFormatter },
} = require('../lib/json2csv');

async function parseInput(parser, nodeStream) {
  return parser.parse(nodeStream);
}

module.exports = (testRunner, jsonFixtures, csvFixtures) => {
  testRunner.add('should not modify the JSON object passed passed', async (t) => {
    const opts = {
      fields: ["carModel","price","extras.items.name","extras.items.items.position","extras.items.items.color","extras.items.color"],
      transforms: [unwind({ paths: ['extras.items', 'extras.items.items'] }), flatten()],
    };
    const originalJson = JSON.parse(JSON.stringify(jsonFixtures.unwindComplexObject()));

    const parser = new Parser(opts);
    const csv = await parseInput(parser, originalJson);

    t.equal(csv, csvFixtures.unwindComplexObject);
    t.deepEqual(jsonFixtures.unwindComplexObject(), originalJson);
  });

  testRunner.add('should not modify the opts passed', async (t) => {
    const opts = {};
    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.default());

    t.ok(typeof csv === 'string');
    t.equal(csv, csvFixtures.default);
    t.deepEqual(opts, {});
  });

  testRunner.add('should error if input data is not an object', async (t) => {
    try {
      const parser = new Parser();
      await parseInput(parser, jsonFixtures.notAnObject());

      t.fail('Exception expected');
    } catch (err) {
      t.equal(err.message, 'Data should not be empty or the "fields" option should be included');
    }
  });

  testRunner.add('should handle empty object', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.emptyObject());

    t.equal(csv, csvFixtures.emptyObject);
  });

  testRunner.add('should handle empty array', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.emptyArray());

    t.equal(csv, csvFixtures.emptyObject);
  });

  testRunner.add('should hanlde array with nulls', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.arrayWithNull());

    t.equal(csv, csvFixtures.emptyObject);
  });

  testRunner.add('should handle deep JSON objects', async (t) => {
    const parser = new Parser();
    const csv = await parseInput(parser, jsonFixtures.deepJSON());

    t.equal(csv, csvFixtures.deepJSON);
  });

  testRunner.add('should parse json to csv and infer the fields automatically ', async (t) => {
    const parser = new Parser();
    const csv = await parseInput(parser, jsonFixtures.default());

    t.equal(csv, csvFixtures.default);
  });

  testRunner.add('should parse json to csv using custom fields', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual']
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.default());

    t.equal(csv, csvFixtures.default);
  });

  testRunner.add('should output only selected fields', async (t) => {
    const opts = {
      fields: ['carModel', 'price']
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.default());

    t.equal(csv, csvFixtures.selected);
  });

  testRunner.add('should output fields in the order provided', async (t) => {
    const opts = {
      fields: ['price', 'carModel']
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.default());

    t.equal(csv, csvFixtures.reversed);
  });

  testRunner.add('should output empty value for non-existing fields', async (t) => {
    const opts = {
      fields: ['first not exist field', 'carModel', 'price', 'not exist field', 'color']
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.default());

    t.equal(csv, csvFixtures.withNotExistField);
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

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.default());

    t.equal(csv, csvFixtures.fieldNames);
  });

  testRunner.add('should error on invalid \'fields\' property', async (t) => {
    const opts = {
      fields: [ { value: 'price' }, () => {} ]
    };

    try {
      const parser = new Parser(opts);
      await parseInput(parser, jsonFixtures.default());

      t.fail('Exception expected');
    } catch(error) {
      t.equal(error.message, `Invalid field info option. ${JSON.stringify(opts.fields[1])}`);
    }
  });

  testRunner.add('should error on invalid \'fields.value\' property', async (t) => {
    const opts = {
      fields: [
        { value: row => row.price },
        { label: 'Price USD', value: [] }
      ]
    };

    try {
      const parser = new Parser(opts);
      await parseInput(parser, jsonFixtures.default());

      t.fail('Exception expected');
    } catch(error) {
      t.equal(error.message, `Invalid field info option. ${JSON.stringify(opts.fields[1])}`);
    }
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

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.nested());

    t.equal(csv, csvFixtures.nested);
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

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.functionStringifyByDefault());

    t.equal(csv, csvFixtures.functionStringifyByDefault);
  });

  testRunner.add('field.value function should stringify results by default', async (t) => {
    const opts = {
      fields: [{
        label: 'Value1',
        value: row => row.value1.toLocaleString()
      }]
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.functionStringifyByDefault());

    t.equal(csv, csvFixtures.functionStringifyByDefault);
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

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.fancyfields());

    t.equal(csv, csvFixtures.fancyfields);
  });

  // Default value

  testRunner.add('should output the default value as set in \'defaultValue\'', async (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      defaultValue: ''
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.defaultValueEmpty());

    t.equal(csv, csvFixtures.defaultValueEmpty);
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

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.overriddenDefaultValue());

    t.equal(csv, csvFixtures.overriddenDefaultValue);
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

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.overriddenDefaultValue());

    t.equal(csv, csvFixtures.overriddenDefaultValue);
  });

  // Delimiter

  testRunner.add('should use a custom delimiter when \'delimiter\' property is defined', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      delimiter: '\t'
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.default());

    t.equal(csv, csvFixtures.tsv);
  });

  testRunner.add('should remove last delimiter |@|', async (t) => {
    const opts = { delimiter: '|@|' };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.delimiter());

    t.equal(csv, csvFixtures.delimiter);
  });

  // EOL

  testRunner.add('should use a custom eol character when \'eol\' property is present', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      eol: '\r\n'
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.default());

    t.equal(csv, csvFixtures.eol);
  });

  // Header

  testRunner.add('should parse json to csv without column title', async (t) => {
    const opts = {
      header: false,
      fields: ['carModel', 'price', 'color', 'manual']
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.default());

    t.equal(csv, csvFixtures.withoutHeader);
  });

  // Include empty rows

  testRunner.add('should not include empty rows when options.includeEmptyRows is not specified', async (t) => {
    const parser = new Parser();
    const csv = await parseInput(parser, jsonFixtures.emptyRow());

    t.equal(csv, csvFixtures.emptyRowNotIncluded);
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true', async (t) => {
    const opts = {
      includeEmptyRows: true
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.emptyRow());

    t.equal(csv, csvFixtures.emptyRow);
  });

  testRunner.add('should not include empty rows when options.includeEmptyRows is false', async (t) => {
    const opts = {
      includeEmptyRows: false,
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.emptyRow());

    t.equal(csv, csvFixtures.emptyRowNotIncluded);
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

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.emptyRow());

    t.equal(csv, csvFixtures.emptyRowDefaultValues);
  });

  testRunner.add('should parse data:[null] to csv with only column title, despite options.includeEmptyRows', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      includeEmptyRows: true,
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.arrayWithNull());

    t.equal(csv, csvFixtures.emptyObject);
  });

  // BOM

  testRunner.add('should add BOM character', async (t) => {
    const opts = {
      withBOM: true,
      fields: ['carModel', 'price', 'color', 'manual']
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.specialCharacters());

    // Compare csv length to check if the BOM character is present
    t.equal(csv[0], '\ufeff');
    t.equal(csv.length, csvFixtures.default.length + 1);
    t.equal(csv.length, csvFixtures.withBOM.length);
  });

  // Transforms

  testRunner.add('should unwind all unwindable fields using the unwind transform', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'extras.items.name', 'extras.items.color', 'extras.items.items.position', 'extras.items.items.color'],
      transforms: [unwind()],
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.unwind2());

    t.equal(csv, csvFixtures.unwind2);
  });

  testRunner.add('should support unwinding specific fields using the unwind transform', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'colors'],
      transforms: [unwind({ paths: ['colors'] })],
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.unwind());

    t.equal(csv, csvFixtures.unwind);
  });

  testRunner.add('should support multi-level unwind using the unwind transform', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'extras.items.name', 'extras.items.color', 'extras.items.items.position', 'extras.items.items.color'],
      transforms: [unwind({ paths: ['extras.items', 'extras.items.items'] })],
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.unwind2());

    t.equal(csv, csvFixtures.unwind2);
  });

  testRunner.add('should support unwind and blank out repeated data using the unwind transform', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'extras.items.name', 'extras.items.color', 'extras.items.items.position', 'extras.items.items.color'],
      transforms: [unwind({ paths: ['extras.items', 'extras.items.items'], blankOut: true })],
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.unwind2());

    t.equal(csv, csvFixtures.unwind2Blank);
  });

  testRunner.add('should support flattening deep JSON using the flatten transform', async (t) => {
    const opts = {
      transforms: [flatten()],
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.deepJSON());

    t.equal(csv, csvFixtures.flattenedDeepJSON);
  });

  testRunner.add('should support flattening JSON with nested arrays using the flatten transform', async (t) => {
    const opts = {
      transforms: [flatten({ arrays: true })],
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.flattenArrays());

    t.equal(csv, csvFixtures.flattenedArrays);
  });

  testRunner.add('should support custom flatten separator using the flatten transform', async (t) => {
    const opts = {
      transforms: [flatten({ separator: '__' })],
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.deepJSON());

    t.equal(csv, csvFixtures.flattenedCustomSeparatorDeepJSON);
  });

  testRunner.add('should support multiple transforms and honor the order in which they are declared', async (t) => {
    const opts = {
      transforms: [unwind({ paths: ['items'] }), flatten()],
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.unwindAndFlatten());

    t.equal(csv, csvFixtures.unwindAndFlatten);
  });

  testRunner.add('should unwind complex objects using the unwind transform', async (t) => {
    const opts = {
      fields: ["carModel","price","extras.items.name","extras.items.items.position","extras.items.items.color","extras.items.color"],
      transforms: [unwind({ paths: ['extras.items', 'extras.items.items'] }), flatten()],
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.unwindComplexObject());

    t.equal(csv, csvFixtures.unwindComplexObject);
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

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.default());

    t.equal(csv, csvFixtures.defaultCustomTransform);
  });

  // Formatters

  // Number

  testRunner.add('should used a custom separator when \'decimals\' is passed to the number formatter', async (t) => {
    const opts = {
      formatters: {
        number: numberFormatter({ decimals: 2 })
      }
    };
    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.numberFormatter());

    t.equal(csv, csvFixtures.numberFixedDecimals);
  });

  testRunner.add('should used a custom separator when \'separator\' is passed to the number formatter', async (t) => {
    const opts = {
      delimiter: ';',
      formatters: {
        number: numberFormatter({ separator: ',' })
      }
    };
    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.numberFormatter());

    t.equal(csv, csvFixtures.numberCustomSeparator);
  });

  testRunner.add('should used a custom separator and fixed number of decimals when \'separator\' and \'decimals\' are passed to the number formatter', async (t) => {
    const opts = {
      delimiter: ';',
      formatters: {
        number: numberFormatter({ separator: ',', decimals: 2 })
      }
    };
    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.numberFormatter());

    t.equal(csv, csvFixtures.numberFixedDecimalsAndCustomSeparator);
  });

  // Symbol

  testRunner.add('should format Symbol by its name', async (t) => {
    const transformOpts = { objectMode: true };

    const parser = new Parser({}, transformOpts);
    const csv = await parseInput(parser, jsonFixtures.symbol({ objectMode: true }));

    t.equal(csv, csvFixtures.symbol);
  });

  // String Quote

  testRunner.add('should use a custom quote when \'quote\' property is present', async (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      formatters: {
        string: stringFormatter({ quote: '\'' })
      }
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.default());

    t.equal(csv, csvFixtures.withSimpleQuotes);
  });

  testRunner.add('should be able to don\'t output quotes when setting \'quote\' to empty string', async (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      formatters: {
        string: stringFormatter({ quote: '' })
      }
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.default());

    t.equal(csv, csvFixtures.withoutQuotes);
  });

  testRunner.add('should escape quotes when setting \'quote\' property is present', async (t) => {
    const opts = {
      fields: ['carModel', 'color'],
      formatters: {
        string: stringFormatter({ quote: '\'' })
      }
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.escapeCustomQuotes());

    t.equal(csv, csvFixtures.escapeCustomQuotes);
  });

  testRunner.add('should not escape \'"\' when setting \'quote\' set to something else', async (t) => {
    const opts = {
      formatters: {
        string: stringFormatter({ quote: '\'' })
      }
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.escapedQuotes());

    t.equal(csv, csvFixtures.escapedQuotesUnescaped);
  });

  // String Escaped Quote

  testRunner.add('should escape quotes with double quotes', async (t) => {
    const parser = new Parser();
    const csv = await parseInput(parser, jsonFixtures.quotes());

    t.equal(csv, csvFixtures.quotes);
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslash in the end', async (t) => {
    const parser = new Parser();
    const csv = await parseInput(parser, jsonFixtures.backslashAtEnd());

    t.equal(csv, csvFixtures.backslashAtEnd);
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslash in the end, and its not the last column', async (t) => {
    const parser = new Parser();
    const csv = await parseInput(parser, jsonFixtures.backslashAtEndInMiddleColumn());

    t.equal(csv, csvFixtures.backslashAtEndInMiddleColumn);
  });

  testRunner.add('should escape quotes with value in \'escapedQuote\'', async (t) => {
    const opts = {
      fields: ['a string'],
      formatters: {
        string: stringFormatter({ escapedQuote: '*' })
      }
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.escapedQuotes());

    t.equal(csv, csvFixtures.escapedQuotes);
  });

  testRunner.add('should escape quotes before new line with value in \'escapedQuote\'', async (t) => {
    const opts = {
      fields: ['a string']
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.backslashBeforeNewLine());

    t.equal(csv, csvFixtures.backslashBeforeNewLine);
  });

  // String Quote Only if Necessary

  testRunner.add('should quote only if necessary if using stringQuoteOnlyIfNecessary formatter', async (t) => {
    const opts = {
      formatters: {
        string: stringQuoteOnlyIfNecessaryFormatter()
      }
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.quoteOnlyIfNecessary());

    t.equal(csv, csvFixtures.quoteOnlyIfNecessary);
  });

  // String Excel

  testRunner.add('should format strings to force excel to view the values as strings', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      formatters: {
        string: stringExcelFormatter
      }
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.default());

    t.equal(csv, csvFixtures.excelStrings);
  });

  testRunner.add('should format strings to force excel to view the values as strings with escaped quotes', async (t) => {
    const opts = {
      formatters: {
        string: stringExcelFormatter
      }
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.quotes());

    t.equal(csv, csvFixtures.excelStringsWithEscapedQuoted);
  });

  // String Escaping and preserving values

  testRunner.add('should parse JSON values with trailing backslashes', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.trailingBackslash());

    t.equal(csv, csvFixtures.trailingBackslash);
  });

  testRunner.add('should escape " when preceeded by \\', async (t) => {
    const parser = new Parser();
    const csv = await parseInput(parser, jsonFixtures.escapeDoubleBackslashedEscapedQuote());

    t.equal(csv, csvFixtures.escapeDoubleBackslashedEscapedQuote);
  });

  testRunner.add('should preserve new lines in values', async (t) => {
    const opts = {
      eol: '\r\n'
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.escapeEOL());


    t.equal(csv, [
      '"a string"',
      '"with a \u2028description\\n and\na new line"',
      '"with a \u2029\u2028description and\r\nanother new line"'
    ].join('\r\n'));

  });

  testRunner.add('should preserve tabs in values', async (t) => {
    const parser = new Parser();
    const csv = await parseInput(parser, jsonFixtures.escapeTab());

    t.equal(csv, csvFixtures.escapeTab);
  });

  // Headers

  testRunner.add('should format headers based on the headers formatter', async (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'manual'],
      formatters: {
        header: stringFormatter({ quote: '' })
      }
    };

    const parser = new Parser(opts);
    const csv = await parseInput(parser, jsonFixtures.default());

    t.equal(csv, csvFixtures.customHeaderQuotes);
  });
};
